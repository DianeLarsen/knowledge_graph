import { createUser, getAllUsers } from "./queries/users";
import { createNote } from "./queries/notes";
import { createTag } from "./queries/tags";
import { addTagToNote } from "./queries/entitytags";
import { createEntityLink } from "./queries/entitylinks";
import { createUserReference, addReferenceToNote } from "./queries/references";
import { createUserTask } from "./queries/tasks";
import { createUserEvent } from "./queries/calendar";

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

function requireSeedValue<T>(value: T | null | undefined, label: string): T {
  if (!value) {
    throw new Error(`Failed to create seed value: ${label}`);
  }

  return value;
}

async function seed() {
  const existing = await getAllUsers();

  if (existing.length > 0) {
    console.log("Seed already exists, skipping");
    return;
  }

  const user = requireSeedValue(
    await createUser({
      name: "Diane Dev",
      email: "annieml99@hotmail.com",
      clerkId: "user_3DJTiW2TXDvMMqCIbAw8zbaSTLC",
    }),
    "user",
  );

  console.log("Created user:", user);

  const sqljoins = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "SQL Joins",
      content:
        "SQL joins combine rows from two or more tables based on related columns.",
      contentJson: makeContentJson(
        "SQL joins combine rows from two or more tables based on related columns.",
      ),
    }),
    "SQL Joins note",
  );

  const drizzleorm = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Drizzle ORM",
      content:
        "Drizzle ORM is a TypeScript ORM that keeps database queries strongly typed.",
      contentJson: makeContentJson(
        "Drizzle ORM is a TypeScript ORM that keeps database queries strongly typed.",
      ),
    }),
    "Drizzle ORM note",
  );

  const sqlite = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "SQLite",
      content:
        "SQLite is a lightweight relational database stored in a single file.",
      contentJson: makeContentJson(
        "SQLite is a lightweight relational database stored in a single file.",
      ),
    }),
    "SQLite note",
  );

  const knowledgegraphs = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Knowledge Graphs",
      content: "Knowledge graphs connect ideas using nodes and relationships.",
      contentJson: makeContentJson(
        "Knowledge graphs connect ideas using nodes and relationships.",
      ),
    }),
    "Knowledge Graphs note",
  );

  const backlinks = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Backlinks",
      content: "Backlinks show which notes point back to the current note.",
      contentJson: makeContentJson(
        "Backlinks show which notes point back to the current note.",
      ),
    }),
    "Backlinks note",
  );

  const searchqueries = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Search Queries",
      content:
        "Search queries help users find notes by title, content, tags, and references.",
      contentJson: makeContentJson(
        "Search queries help users find notes by title, content, tags, and references.",
      ),
    }),
    "Search Queries note",
  );

  console.log("Created notes:", {
    sqljoins,
    drizzleorm,
    sqlite,
    knowledgegraphs,
    backlinks,
    searchqueries,
  });

  const task1 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: sqljoins.id,
      title: "Review SQL join examples",
      description:
        "Add examples for INNER JOIN, LEFT JOIN, and many-to-many joins.",
      status: "todo",
      priority: "medium",
      dueDate: "2026-05-01",
    }),
    "task1",
  );

  const task2 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: drizzleorm.id,
      title: "Add Drizzle query examples",
      description:
        "Create examples for select, insert, update, delete, and joins.",
      status: "in_progress",
      priority: "high",
      dueDate: "2026-05-03",
    }),
    "task2",
  );

  const task3 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: sqlite.id,
      title: "Document SQLite reset behavior",
      description: "Explain delete order and foreign key constraints.",
      status: "todo",
      priority: "medium",
    }),
    "task3",
  );

  const task4 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: knowledgegraphs.id,
      title: "Sketch note relationship map",
      description:
        "Show how notes, tags, links, references, and tasks connect.",
      status: "todo",
      priority: "high",
    }),
    "task4",
  );

  const task5 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: backlinks.id,
      title: "Display backlinks on note cards",
      description: "Show a small backlink count or related note preview.",
      status: "done",
      priority: "low",
    }),
    "task5",
  );

  console.log("Created tasks:", { task1, task2, task3, task4, task5 });

  const database = requireSeedValue(
    await createTag(user.id, "database"),
    "database tag",
  );
  const typescript = requireSeedValue(
    await createTag(user.id, "typescript"),
    "typescript tag",
  );
  const noteTag = requireSeedValue(
    await createTag(user.id, "notes"),
    "notes tag",
  );
  const querying = requireSeedValue(
    await createTag(user.id, "querying"),
    "querying tag",
  );

  console.log("Created tags:", database, typescript, noteTag, querying);

  console.log("Added tags to notes:", {
    noteTag1: await addTagToNote(user.id, sqljoins.id, database.id),
    noteTag2: await addTagToNote(user.id, drizzleorm.id, typescript.id),
    noteTag3: await addTagToNote(user.id, sqlite.id, database.id),
    noteTag4: await addTagToNote(user.id, knowledgegraphs.id, noteTag.id),
    noteTag5: await addTagToNote(user.id, sqljoins.id, querying.id),
    noteTag6: await addTagToNote(user.id, drizzleorm.id, database.id),
    noteTag7: await addTagToNote(user.id, backlinks.id, noteTag.id),
    noteTag8: await addTagToNote(user.id, searchqueries.id, querying.id),
  });

  const sqlReference = requireSeedValue(
    await createUserReference(user.id, {
      type: "website",
      title: "SQL Joins Documentation",
      author: "W3Schools",
      url: "https://www.w3schools.com/sql/sql_join.asp",
      publisher: "W3Schools",
      citation: "W3Schools. SQL Joins.",
      notes: "Basic overview of SQL join types.",
    }),
    "SQL reference",
  );

  const drizzleReference = requireSeedValue(
    await createUserReference(user.id, {
      type: "website",
      title: "Drizzle ORM Documentation",
      author: "Drizzle Team",
      url: "https://orm.drizzle.team/docs/overview",
      publisher: "Drizzle ORM",
      citation: "Drizzle Team. Drizzle ORM Documentation.",
      notes: "Official docs for Drizzle ORM concepts and setup.",
    }),
    "Drizzle reference",
  );

  const sqliteReference = requireSeedValue(
    await createUserReference(user.id, {
      type: "website",
      title: "SQLite Documentation",
      author: "SQLite",
      url: "https://www.sqlite.org/docs.html",
      publisher: "SQLite",
      citation: "SQLite. SQLite Documentation.",
      notes: "Official SQLite documentation.",
    }),
    "SQLite reference",
  );

  const graphReference = requireSeedValue(
    await createUserReference(user.id, {
      type: "article",
      title: "Knowledge Graph Concepts",
      author: "Seed Data",
      publisher: "Local Notes",
      citation: "Seed Data. Knowledge Graph Concepts.",
      notes: "Placeholder reference for knowledge graph note testing.",
    }),
    "Graph reference",
  );

  console.log("Created references:", {
    sqlReference,
    drizzleReference,
    sqliteReference,
    graphReference,
  });

  console.log("Added references to notes:", {
    noteRef1: await addReferenceToNote({
      noteId: sqljoins.id,
      referenceId: sqlReference.id,
      summary: "Used as a general SQL joins reference.",
    }),
    noteRef2: await addReferenceToNote({
      noteId: drizzleorm.id,
      referenceId: drizzleReference.id,
      summary: "Used as the main Drizzle ORM reference.",
    }),
    noteRef3: await addReferenceToNote({
      noteId: sqlite.id,
      referenceId: sqliteReference.id,
      summary: "Used as the main SQLite reference.",
    }),
    noteRef4: await addReferenceToNote({
      noteId: knowledgegraphs.id,
      referenceId: graphReference.id,
      summary:
        "Used as a concept reference for graph-based note relationships.",
    }),
    noteRef5: await addReferenceToNote({
      noteId: backlinks.id,
      referenceId: graphReference.id,
      summary: "Backlinks are related to graph-style note connections.",
    }),
    noteRef6: await addReferenceToNote({
      noteId: searchqueries.id,
      referenceId: drizzleReference.id,
      summary:
        "Search query behavior will likely be implemented through typed database queries.",
    }),
  });

  console.log("Created note links:", {
    noteLink1: await createEntityLink({
      createdByUserId: user.id,
      sourceType: "note",
      sourceId: sqljoins.id,
      targetType: "note",
      targetId: drizzleorm.id,
      relationshipType: "supports",
    }),
    noteLink2: await createEntityLink({
      createdByUserId: user.id,
      sourceType: "note",
      sourceId: sqljoins.id,
      targetType: "note",
      targetId: sqlite.id,
      relationshipType: "uses",
    }),
    noteLink3: await createEntityLink({
      createdByUserId: user.id,
      sourceType: "note",
      sourceId: drizzleorm.id,
      targetType: "note",
      targetId: knowledgegraphs.id,
      relationshipType: "related",
      label: "explains",
    }),
    noteLink4: await createEntityLink({
      createdByUserId: user.id,
      sourceType: "note",
      sourceId: sqlite.id,
      targetType: "note",
      targetId: backlinks.id,
      relationshipType: "related",
    }),
  });

  const event1 = await createUserEvent(user.id, {
    noteId: sqljoins.id,
    taskId: task1.id,
    title: "Study SQL joins",
    description:
      "Review SQL join examples and connect them to the SQL Joins note.",
    startDate: "2026-05-01",
    endDate: "2026-05-01",
    startTime: "18:00",
    endTime: "19:30",
    allDay: false,
    location: "Portfolio workspace",
    status: "planned",
  });

  const event2 = await createUserEvent(user.id, {
    noteId: drizzleorm.id,
    taskId: task2.id,
    title: "Build Drizzle examples",
    description: "Work on typed query examples for the Drizzle ORM note.",
    startDate: "2026-05-03",
    endDate: "2026-05-03",
    startTime: "10:00",
    endTime: "12:00",
    allDay: false,
    location: "Portfolio workspace",
    status: "planned",
  });

  const event3 = await createUserEvent(user.id, {
    noteId: knowledgegraphs.id,
    taskId: task4.id,
    title: "Plan knowledge graph map",
    description: "Sketch system connections across notes, tasks, and calendar.",
    startDate: "2026-05-05",
    endDate: "2026-05-05",
    startTime: "14:00",
    endTime: "16:00",
    allDay: false,
    location: "Planning board",
    status: "planned",
  });

  const event4 = await createUserEvent(user.id, {
    title: "Weekly planning review",
    description: "Review open tasks, deadlines, and next priorities.",
    startDate: "2026-05-06",
    endDate: "2026-05-06",
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
    location: "Calendar",
    status: "planned",
  });

  const event5 = await createUserEvent(user.id, {
    title: "Deep work session",
    description: "Focus on calendar + task integration.",
    startDate: "2026-05-03",
    endDate: "2026-05-03",
    startTime: "13:00",
    endTime: "16:00",
    allDay: false,
    location: "Desk",
    status: "planned",
  });

  const event6 = await createUserEvent(user.id, {
    title: "Quick check-in",
    description: "Review progress and adjust plan.",
    startDate: "2026-05-05",
    endDate: "2026-05-05",
    startTime: "16:30",
    endTime: "17:00",
    allDay: false,
    location: "Desk",
    status: "planned",
  });

  const event7 = await createUserEvent(user.id, {
    title: "Feature sprint: Calendar",
    description: "Build event editing, time support, and UI polish.",
    startDate: "2026-05-07",
    endDate: "2026-05-09",
    startTime: "09:00",
    endTime: "17:00",
    allDay: false,
    location: "Workspace",
    status: "planned",
  });

  const event8 = await createUserEvent(user.id, {
    title: "Family day",
    description: "No coding. Try to remember sunlight exists.",
    startDate: "2026-05-10",
    endDate: "2026-05-10",
    allDay: true,
    location: "Outside (allegedly)",
    status: "planned",
  });

  console.log("Created events:", {
    event1,
    event2,
    event3,
    event4,
    event5,
    event6,
    event7,
    event8,
  });

  console.log("Seeding complete.");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
});
