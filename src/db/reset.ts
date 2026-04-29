import { db } from "./index";
import {
  noteLinks,
  noteTags,
  noteReferences,
  notes,
  tags,
  referencesTable,
  users,
} from "./schema";

export async function resetDatabase() {
  console.log("Resetting database...");

  // Children first (they reference other tables)
  await db.delete(noteLinks);
  await db.delete(noteTags);
  await db.delete(noteReferences);

  // Then main tables
  await db.delete(notes);
  await db.delete(tags);
  await db.delete(referencesTable);

  // Finally users (top-level parent)
  await db.delete(users);

  console.log("Database cleared.");
}

resetDatabase().catch((err) => {
  console.error("Reset failed:", err);
});