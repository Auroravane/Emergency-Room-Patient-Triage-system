import { seedDatabase } from "../src/db/seed";

async function main() {
  console.log("Starting seed script...");
  // In local test context without live D1 binding, this script can be invoked with miniflare or wrangler
  console.log("Seed script ready for local Miniflare D1 execution.");
}

main().catch(console.error);
