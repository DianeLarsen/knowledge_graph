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

  await db.delete(entityLinks);
  await db.delete(entityTags);

  await db.delete(projectItems);
  await db.delete(projectMemberPermissions);
  await db.delete(projectMembers);

  await db.delete(events);
  await db.delete(tasks);
  await db.delete(captures);

  await db.delete(notes);
  await db.delete(referencesTable);
  await db.delete(tags);
  await db.delete(projects);

  await db.delete(users);

  console.log("Database cleared.");
}

resetDatabase().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
