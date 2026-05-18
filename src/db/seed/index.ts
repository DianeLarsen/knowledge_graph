import { getAllUsers } from "../queries/users";
import { seedUser } from "./seedUser";
import { seedTags } from "./seedTags";
import { seedReferences } from "./seedReferences";
import { seedNotes } from "./seedNotes";
import { seedTasks } from "./seedTasks";
import { seedEvents } from "./seedEvents";
import { seedLinks } from "./seedLinks";
import { seedProjects } from "./seedProjects";

async function seed() {
  const existingUsers = await getAllUsers();
  const existingSeedUser = existingUsers.find(
    (user) => user.email === "annieml99@hotmail.com",
  );

  if (existingSeedUser) {
    console.log("Seed user already exists, skipping");
    return;
  }

  const user = await seedUser();
  console.log("User Created:", user.id);
  const tags = await seedTags(user.id);
  const references = await seedReferences(user.id);
  const notes = await seedNotes(user.id, tags, references);
  const tasks = await seedTasks(user.id, notes);
  const events = await seedEvents(user.id, notes, tasks);

  await seedLinks(user.id, notes, references);
  await seedProjects(user.id, notes, tasks, events, references);

  console.log("Seeding complete.");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
});
