import {
    createUser,
    getAllUsers,
} from "./queries/users";
import { createNote } from "./queries/notes";
import { createTag } from "./queries/tags";
import { addTagToNote } from "./queries/notetags";
import { createNoteLink } from "./queries/noteLinks";

async function seed() {
    const existing = await getAllUsers();
if (existing.length > 0) {
  console.log("Seed already exists, skipping");
  return;
}
    const user = await createUser("Default User");
    console.log("Created user:", user);
    const sqljoins = await createNote("SQL Joins", "This is the content of the first note.", user.id);
    const drizzleorm = await createNote("Drizzle ORM", "This is the content of the second note.", user.id);
    const sqlite = await createNote("SQLite", "This is the content of the third note.", user.id);
    const knowledgegraphs = await createNote("Knowledge Graphs", "This is the content of the fourth note.", user.id);
    const backlinks = await createNote("Backlinks", "This is the content of the fifth note.", user.id);
    const searchqueries = await createNote("Search Queries", "This is the content of the sixth note.", user.id);
    console.log("Created notes:", sqljoins, drizzleorm, sqlite, knowledgegraphs, backlinks, searchqueries);
    const database = await createTag("database");
    const typescript = await createTag("typescript");
    const notes = await createTag("notes");
    const querying = await createTag("querying");
    console.log("Created tag:", database, typescript, notes, querying);
    const noteTag1 = await addTagToNote(sqljoins.id, database.id);
    const noteTag2 = await addTagToNote(drizzleorm.id, typescript.id);
    const noteTag3 = await addTagToNote(sqlite.id, database.id);
    const noteTag4 = await addTagToNote(knowledgegraphs.id, notes.id);
    const noteTag5 = await addTagToNote(sqljoins.id, querying.id);
    const noteTag6 = await addTagToNote(drizzleorm.id, database.id);
    const noteTag7 = await addTagToNote(backlinks.id, notes.id);
    const noteTag8 = await addTagToNote(searchqueries.id, querying.id);
    console.log("Added tags to notes:", noteTag1, noteTag2, noteTag3, noteTag4, noteTag5, noteTag6, noteTag7, noteTag8);
    const noteLink1 = await createNoteLink(sqljoins.id, drizzleorm.id, "supports");
    const noteLink2 = await createNoteLink(sqljoins.id, sqlite.id, "uses");
    const noteLink3 = await createNoteLink(drizzleorm.id, knowledgegraphs.id, "explains");
    const noteLink4 = await createNoteLink(sqlite.id, backlinks.id, "related");
    console.log("Created note links:", noteLink1, noteLink2, noteLink3, noteLink4);
    console.log("Seeding complete.");

}

seed().catch((error) => {
    console.error("Error seeding database:", error);
}); 