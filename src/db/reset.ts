import { db } from "./index";
import {
  tasks,
  notes,
  tags,
  referencesTable,
  users,
  events,
  captures,
  entityLinks,
  entityTags,
  projectItems,
  projectMemberPermissions,
  projectMembers,
  projects,
} from "./schema";

export async function resetDatabase() {
  console.log("Resetting database...");

  // Relationship / join tables first
  await db.delete(entityLinks);
  await db.delete(entityTags);
  await db.delete(projectItems);
  await db.delete(projectMemberPermissions);
  await db.delete(projectMembers);

  // Child tables
  await db.delete(events);
  await db.delete(tasks);
  await db.delete(captures);

  // Main entity tables
  await db.delete(notes);
  await db.delete(tags);
  await db.delete(referencesTable);
  await db.delete(projects);

  // Top-level parent
  await db.delete(users);

  console.log("Database cleared.");
}

resetDatabase().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
