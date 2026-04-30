import { db } from "./index";
import {
  noteLinks,
  noteTags,
  noteReferences,
  tasks,
  notes,
  tags,
  referencesTable,
  users,
  events, // <-- you forgot me
} from "./schema";

export async function resetDatabase() {
  console.log("Resetting database...");

  // Children first (anything with foreign keys)

  await db.delete(noteLinks);
  await db.delete(noteTags);
  await db.delete(noteReferences);

  await db.delete(events); // <-- must come before tasks/notes

  // Then main tables
  await db.delete(tasks);
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