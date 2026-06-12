import { getObjectRepository } from "@/lib/repositories/objects";

async function main() {
  const repository = getObjectRepository();
  await repository.seedIfEmpty();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
