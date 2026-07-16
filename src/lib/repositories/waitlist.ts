import { eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { waitlistSignups } from "@/db/schema";
import { getWishlistMode } from "@/lib/config/wishlistMode";

export type WaitlistRepository = {
  add(email: string): Promise<{ created: boolean }>;
};

const normalize = (email: string) => email.trim().toLowerCase();

export class InMemoryWaitlistRepository implements WaitlistRepository {
  private store = new Set<string>();

  async add(email: string) {
    const key = normalize(email);
    if (this.store.has(key)) return { created: false };
    this.store.add(key);
    return { created: true };
  }

  emails() {
    return [...this.store];
  }
}

class DrizzleWaitlistRepository implements WaitlistRepository {
  constructor(private db: NonNullable<ReturnType<typeof getDatabase>>) {}

  async add(email: string) {
    const key = normalize(email);
    const existing = await this.db
      .select({ id: waitlistSignups.id })
      .from(waitlistSignups)
      .where(eq(waitlistSignups.email, key))
      .limit(1);
    if (existing.length > 0) return { created: false };
    await this.db.insert(waitlistSignups).values({ email: key });
    return { created: true };
  }
}

// Module singleton so mock-mode signups persist for the server's lifetime
// (matches the object mock repository behaviour).
let memoryWaitlist: InMemoryWaitlistRepository | null = null;

export function createWaitlistRepository(): WaitlistRepository {
  if (getWishlistMode() === "mock") {
    if (!memoryWaitlist) memoryWaitlist = new InMemoryWaitlistRepository();
    return memoryWaitlist;
  }
  const db = getDatabase();
  if (db) return new DrizzleWaitlistRepository(db);
  // No DATABASE_URL in a live deploy is a misconfiguration — fail loudly rather
  // than silently dropping signups.
  throw new Error("Waitlist requires DATABASE_URL in live mode");
}
