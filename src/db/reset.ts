import { db } from "./index";
import { noteLinks, noteTags, notes, tags, users } from "./schema";

export async function resetDatabase() {
  console.log("Resetting database...");

  await db.delete(noteLinks);
  await db.delete(noteTags);
  await db.delete(notes);
  await db.delete(tags);
  await db.delete(users);

  console.log("Database cleared.");
}

resetDatabase().catch((err) => {
  console.error("Reset failed:", err);
});