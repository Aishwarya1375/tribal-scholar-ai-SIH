import { db } from '../config/db.ts';

async function runSeed() {
  console.log('[Seed] Initializing database seed...');
  await db.init();
  db.resetToSeed();
  console.log('[Seed] Database seed completed successfully!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
