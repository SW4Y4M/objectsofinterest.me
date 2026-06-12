import { unlockStudio } from "./actions";

export default async function StudioUnlockPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-wall px-6 text-ink">
      <form action={unlockStudio} className="w-full max-w-sm border border-line bg-label p-6 shadow-label">
        <h1 className="text-lg font-medium">Studio</h1>
        <label className="mt-6 block text-sm text-muted" htmlFor="passcode">
          Passcode
        </label>
        <input id="passcode" name="passcode" type="password" className="mt-2 w-full border border-line bg-wall px-3 py-2 text-ink" />
        {params.error ? <p className="mt-3 text-sm text-muted">Passcode did not match.</p> : null}
        <button type="submit" className="mt-6 w-full bg-ink px-4 py-2 text-wall">
          Unlock
        </button>
      </form>
    </main>
  );
}
