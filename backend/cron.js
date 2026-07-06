import { getDB } from './data/db.js';

export async function executeGuestCartGarbageCollection() {
  console.log("[Cron Engine]: Sweeping SQLite database for old inactive guest items...");
  try {
    const db = await getDB();
    // Native SQLite command matching your exact layout criteria
    const result = await db.run(
      "DELETE FROM cart_items WHERE guest_id IS NOT NULL AND updated_at < datetime('now', '-3 month')"
    );
    console.log(`[Cron Engine Summary]: Cleaned up ${result.changes} inactive rows.`);
  } catch (err) {
    console.error("[Cron Engine Error]: Failed garbage collection:", err);
  }
}

// Automatically runs every 24 hours
setInterval(executeGuestCartGarbageCollection, 1000 * 60 * 60 * 24);