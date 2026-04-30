import { createUser, getAllUsers } from "./queries/users";
import { createNote } from "./queries/notes";
import { createTag } from "./queries/tags";
import { addTagToNote } from "./queries/notetags";
import { createNoteLink } from "./queries/noteLinks";
import { createReference, addReferenceToNote } from "./queries/references";
import { createTask } from "./queries/tasks";
import { createEvent } from "./queries/calendar";

function makeContentJson(content: string) {
  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      },
    ],
  });
}

async function seed() {
  const existing = await getAllUsers();

  if (existing.length > 0) {
    console.log("Seed already exists, skipping");
    return;
  }

  const user = await createUser("Default User");
  console.log("Created user:", user);

  const sqljoins = await createNote({
    userId: user.id,
    title: "SQL Joins",
    content: "SQL joins combine rows from two or more tables based on related columns.",
    contentJson: makeContentJson(
      "SQL joins combine rows from two or more tables based on related columns.",
    ),
  });

  const drizzleorm = await createNote({
    userId: user.id,
    title: "Drizzle ORM",
    content: "Drizzle ORM is a TypeScript ORM that keeps database queries strongly typed.",
    contentJson: makeContentJson(
      "Drizzle ORM is a TypeScript ORM that keeps database queries strongly typed.",
    ),
  });

  const sqlite = await createNote({
    userId: user.id,
    title: "SQLite",
    content: "SQLite is a lightweight relational database stored in a single file.",
    contentJson: makeContentJson(
      "SQLite is a lightweight relational database stored in a single file.",
    ),
  });

  const knowledgegraphs = await createNote({
    userId: user.id,
    title: "Knowledge Graphs",
    content: "Knowledge graphs connect ideas using nodes and relationships.",
    contentJson: makeContentJson(
      "Knowledge graphs connect ideas using nodes and relationships.",
    ),
  });

  const backlinks = await createNote({
    userId: user.id,
    title: "Backlinks",
    content: "Backlinks show which notes point back to the current note.",
    contentJson: makeContentJson(
      "Backlinks show which notes point back to the current note.",
    ),
  });

  const searchqueries = await createNote({
    userId: user.id,
    title: "Search Queries",
    content: "Search queries help users find notes by title, content, tags, and references.",
    contentJson: makeContentJson(
      "Search queries help users find notes by title, content, tags, and references.",
    ),
  });

  console.log("Created notes:", {
    sqljoins,
    drizzleorm,
    sqlite,
    knowledgegraphs,
    backlinks,
    searchqueries,
  });
const task1 = await createTask({
  userId: user.id,
  noteId: sqljoins.id,
  title: "Review SQL join examples",
  description: "Add examples for INNER JOIN, LEFT JOIN, and many-to-many joins.",
  status: "todo",
  priority: "medium",
  dueDate: "2026-05-01",
});

const task2 = await createTask({
  userId: user.id,
  noteId: drizzleorm.id,
  title: "Add Drizzle query examples",
  description: "Create examples for select, insert, update, delete, and joins.",
  status: "in_progress",
  priority: "high",
  dueDate: "2026-05-03",
});

const task3 = await createTask({
  userId: user.id,
  noteId: sqlite.id,
  title: "Document SQLite reset behavior",
  description: "Explain delete order and foreign key constraints.",
  status: "todo",
  priority: "medium",
});

const task4 = await createTask({
  userId: user.id,
  noteId: knowledgegraphs.id,
  title: "Sketch note relationship map",
  description: "Show how notes, tags, links, references, and tasks connect.",
  status: "todo",
  priority: "high",
});

const task5 = await createTask({
  userId: user.id,
  noteId: backlinks.id,
  title: "Display backlinks on note cards",
  description: "Show a small backlink count or related note preview.",
  status: "done",
  priority: "low",
});

console.log("Created tasks:", {
  task1,
  task2,
  task3,
  task4,
  task5,
});
  const database = await createTag("database");
  const typescript = await createTag("typescript");
  const notes = await createTag("notes");
  const querying = await createTag("querying");

  console.log("Created tags:", database, typescript, notes, querying);

  const noteTag1 = await addTagToNote(sqljoins.id, database.id);
  const noteTag2 = await addTagToNote(drizzleorm.id, typescript.id);
  const noteTag3 = await addTagToNote(sqlite.id, database.id);
  const noteTag4 = await addTagToNote(knowledgegraphs.id, notes.id);
  const noteTag5 = await addTagToNote(sqljoins.id, querying.id);
  const noteTag6 = await addTagToNote(drizzleorm.id, database.id);
  const noteTag7 = await addTagToNote(backlinks.id, notes.id);
  const noteTag8 = await addTagToNote(searchqueries.id, querying.id);

  console.log("Added tags to notes:", {
    noteTag1,
    noteTag2,
    noteTag3,
    noteTag4,
    noteTag5,
    noteTag6,
    noteTag7,
    noteTag8,
  });

  const sqlReference = await createReference({
    userId: user.id,
    type: "website",
    title: "SQL Joins Documentation",
    author: "W3Schools",
    url: "https://www.w3schools.com/sql/sql_join.asp",
    publisher: "W3Schools",
    citation: "W3Schools. SQL Joins.",
    notes: "Basic overview of SQL join types.",
  });

  const drizzleReference = await createReference({
    userId: user.id,
    type: "website",
    title: "Drizzle ORM Documentation",
    author: "Drizzle Team",
    url: "https://orm.drizzle.team/docs/overview",
    publisher: "Drizzle ORM",
    citation: "Drizzle Team. Drizzle ORM Documentation.",
    notes: "Official docs for Drizzle ORM concepts and setup.",
  });

  const sqliteReference = await createReference({
    userId: user.id,
    type: "website",
    title: "SQLite Documentation",
    author: "SQLite",
    url: "https://www.sqlite.org/docs.html",
    publisher: "SQLite",
    citation: "SQLite. SQLite Documentation.",
    notes: "Official SQLite documentation.",
  });

  const graphReference = await createReference({
    userId: user.id,
    type: "article",
    title: "Knowledge Graph Concepts",
    author: "Seed Data",
    publisher: "Local Notes",
    citation: "Seed Data. Knowledge Graph Concepts.",
    notes: "Placeholder reference for knowledge graph note testing.",
  });

  console.log("Created references:", {
    sqlReference,
    drizzleReference,
    sqliteReference,
    graphReference,
  });

  const noteRef1 = await addReferenceToNote({
    noteId: sqljoins.id,
    referenceId: sqlReference.id,
    summary: "Used as a general SQL joins reference.",
  });

  const noteRef2 = await addReferenceToNote({
    noteId: drizzleorm.id,
    referenceId: drizzleReference.id,
    summary: "Used as the main Drizzle ORM reference.",
  });

  const noteRef3 = await addReferenceToNote({
    noteId: sqlite.id,
    referenceId: sqliteReference.id,
    summary: "Used as the main SQLite reference.",
  });

  const noteRef4 = await addReferenceToNote({
    noteId: knowledgegraphs.id,
    referenceId: graphReference.id,
    summary: "Used as a concept reference for graph-based note relationships.",
  });

  const noteRef5 = await addReferenceToNote({
    noteId: backlinks.id,
    referenceId: graphReference.id,
    summary: "Backlinks are related to graph-style note connections.",
  });

  const noteRef6 = await addReferenceToNote({
    noteId: searchqueries.id,
    referenceId: drizzleReference.id,
    summary: "Search query behavior will likely be implemented through typed database queries.",
  });

  console.log("Added references to notes:", {
    noteRef1,
    noteRef2,
    noteRef3,
    noteRef4,
    noteRef5,
    noteRef6,
  });

  const noteLink1 = await createNoteLink(sqljoins.id, drizzleorm.id, "supports");
  const noteLink2 = await createNoteLink(sqljoins.id, sqlite.id, "uses");
  const noteLink3 = await createNoteLink(drizzleorm.id, knowledgegraphs.id, "explains");
  const noteLink4 = await createNoteLink(sqlite.id, backlinks.id, "related");

  console.log("Created note links:", {
    noteLink1,
    noteLink2,
    noteLink3,
    noteLink4,
  });
const event1 = await createEvent({
  userId: user.id,
  noteId: sqljoins.id,
  taskId: task1.id,
  title: "Study SQL joins",
  description: "Review SQL join examples and connect them to the SQL Joins note.",
  startDate: "2026-05-01",
  endDate: "2026-05-01",
  allDay: true,
  location: "Portfolio workspace",
  status: "planned",
});

const event2 = await createEvent({
  userId: user.id,
  noteId: drizzleorm.id,
  taskId: task2.id,
  title: "Build Drizzle examples",
  description: "Work on typed query examples for the Drizzle ORM note.",
  startDate: "2026-05-03",
  endDate: "2026-05-03",
  allDay: true,
  location: "Portfolio workspace",
  status: "planned",
});

const event3 = await createEvent({
  userId: user.id,
  noteId: knowledgegraphs.id,
  taskId: task4.id,
  title: "Plan knowledge graph map",
  description: "Sketch how notes, tags, links, references, tasks, and calendar events connect.",
  startDate: "2026-05-05",
  endDate: "2026-05-05",
  allDay: true,
  location: "Planning board",
  status: "planned",
});

const event4 = await createEvent({
  userId: user.id,
  title: "Weekly planning review",
  description: "Review open tasks, due dates, notes, and upcoming work.",
  startDate: "2026-05-06",
  endDate: "2026-05-06",
  allDay: true,
  location: "Calendar",
  status: "planned",
});

console.log("Created events:", {
  event1,
  event2,
  event3,
  event4,
});
  console.log("Seeding complete.");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
});