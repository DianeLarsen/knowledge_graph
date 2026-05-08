import { createUser, getAllUsers } from "./queries/users";
import { createNote } from "./queries/notes";
import { createTag } from "./queries/tags";
import { addTagToNote } from "./queries/entitytags";
import { createEntityLink } from "./queries/entitylinks";
import { createUserReference, addReferenceToNote } from "./queries/references";
import { createUserTask } from "./queries/tasks";
import { createUserEvent } from "./queries/calendar";

type TipTapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

function textNode(text: string, marks?: TipTapMark[]) {
  return {
    type: "text",
    text,
    ...(marks?.length ? { marks } : {}),
  };
}

function paragraph(content: ReturnType<typeof textNode>[]) {
  return {
    type: "paragraph",
    content,
  };
}

function makeContentJson(content: unknown[]) {
  return JSON.stringify({
    type: "doc",
    content,
  });
}

function tagMark(tagId: string, tagName: string): TipTapMark {
  return {
    type: "tagMark",
    attrs: {
      tagId,
      tagName,
    },
  };
}

function referenceMark(referenceId: string, label: string): TipTapMark {
  return {
    type: "referenceMark",
    attrs: {
      referenceId,
      label,
    },
  };
}

function highlightMark(): TipTapMark {
  return {
    type: "highlight",
  };
}

function requireSeedValue<T>(value: T | null | undefined, label: string): T {
  if (!value) {
    throw new Error(`Failed to create seed value: ${label}`);
  }

  return value;
}

async function seed() {
const existingUsers = await getAllUsers();
const existingSeedUser = existingUsers.find(
  (user) => user.email === "annieml99@hotmail.com",
);
if (existingSeedUser) {
  console.log("Seed user already exists, skipping");
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

  const capture = requireSeedValue(
    await createTag(user.id, "capture"),
    "capture tag",
  );

  const project = requireSeedValue(
    await createTag(user.id, "project"),
    "project tag",
  );

  console.log("Created tags:", {
    database,
    typescript,
    noteTag,
    querying,
    capture,
    project,
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

  const captureReference = requireSeedValue(
    await createUserReference(user.id, {
      type: "conversation",
      title: "Capture Workflow Planning",
      author: "Seed Data",
      publisher: "Local Notes",
      citation: "Seed Data. Capture Workflow Planning.",
      notes:
        "Placeholder reference for testing Capture-generated notes, tasks, and references.",
    }),
    "Capture reference",
  );

  console.log("Created references:", {
    sqlReference,
    drizzleReference,
    sqliteReference,
    graphReference,
    captureReference,
  });

  const sqljoins = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "SQL Joins",
      content:
        "SQL joins combine rows from multiple tables using related columns.",
      contentJson: makeContentJson([
        paragraph([
          textNode("SQL joins combine rows from multiple tables using "),
          textNode("related columns", [tagMark(database.id, database.name)]),
          textNode(". See "),
          textNode("SQL join docs", [
            referenceMark(sqlReference.id, "SQL join docs"),
          ]),
          textNode(" for examples."),
        ]),
      ]),
    }),
    "SQL Joins note",
  );

  const drizzleorm = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Drizzle ORM",
      content:
        "Drizzle ORM is a TypeScript ORM that keeps database queries strongly typed.",
      contentJson: makeContentJson([
        paragraph([
          textNode("Drizzle ORM keeps "),
          textNode("database queries strongly typed", [
            tagMark(typescript.id, typescript.name),
            highlightMark(),
          ]),
          textNode("."),
        ]),
        paragraph([
          textNode("The official documentation is useful for query examples: "),
          textNode("Drizzle docs", [
            referenceMark(drizzleReference.id, "Drizzle docs"),
          ]),
          textNode("."),
        ]),
      ]),
    }),
    "Drizzle ORM note",
  );

  const sqlite = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "SQLite",
      content:
        "SQLite is a lightweight relational database stored in a single file.",
      contentJson: makeContentJson([
        paragraph([
          textNode("SQLite is a "),
          textNode("single-file relational database", [
            tagMark(database.id, database.name),
          ]),
          textNode(" that works well for local development."),
        ]),
      ]),
    }),
    "SQLite note",
  );

  const knowledgegraphs = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Knowledge Graphs",
      content: "Knowledge graphs connect ideas using nodes and relationships.",
      contentJson: makeContentJson([
        paragraph([
          textNode("Knowledge graphs connect ideas using "),
          textNode("nodes and relationships", [
            tagMark(noteTag.id, noteTag.name),
            referenceMark(graphReference.id, "Knowledge graph concepts"),
          ]),
          textNode("."),
        ]),
      ]),
    }),
    "Knowledge Graphs note",
  );

  const backlinks = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Backlinks",
      content: "Backlinks show which notes point back to the current note.",
      contentJson: makeContentJson([
        paragraph([
          textNode(
            "Backlinks show which notes point back to the current note.",
          ),
        ]),
      ]),
    }),
    "Backlinks note",
  );

  const searchqueries = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Search Queries",
      content:
        "Search queries help users find notes by title, content, tags, and references.",
      contentJson: makeContentJson([
        paragraph([
          textNode("Search queries help users find notes by "),
          textNode("title, content, tags, and references", [
            tagMark(querying.id, querying.name),
          ]),
          textNode("."),
        ]),
      ]),
    }),
    "Search Queries note",
  );

  const captureworkflow = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Capture Workflow",
      content:
        "Capture turns messy input into structured notes, tasks, references, prompts, risks, and next steps.",
      contentJson: makeContentJson([
        paragraph([
          textNode("Capture turns messy input into "),
          textNode("structured thinking", [highlightMark()]),
          textNode(
            ": notes, tasks, references, prompts, risks, and next steps.",
          ),
        ]),
        paragraph([
          textNode("This should connect to "),
          textNode("search", [tagMark(querying.id, querying.name)]),
          textNode(", "),
          textNode("notes", [tagMark(noteTag.id, noteTag.name)]),
          textNode(", and "),
          textNode("Capture planning", [
            referenceMark(captureReference.id, "Capture planning"),
          ]),
          textNode("."),
        ]),
      ]),
    }),
    "Capture Workflow note",
  );

  const orphanNote = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Orphan Note",
      content:
        "This note intentionally has no tags, links, references, tasks, or events.",
      contentJson: makeContentJson([
        paragraph([
          textNode(
            "This note intentionally has no tags, links, references, tasks, or events.",
          ),
        ]),
      ]),
    }),
    "Orphan note",
  );

  const giantRendererTest = requireSeedValue(
    await createNote({
      userId: user.id,
      title: "Renderer Stress Test",
      content:
        "This note tests longer rich text rendering, multiple paragraphs, inline tags, references, highlights, and overflow behavior.",
      contentJson: makeContentJson([
        paragraph([
          textNode("This note tests "),
          textNode("longer rich text rendering", [highlightMark()]),
          textNode(" with multiple paragraphs."),
        ]),
        paragraph([
          textNode("It includes inline "),
          textNode("database", [tagMark(database.id, database.name)]),
          textNode(", "),
          textNode("typescript", [tagMark(typescript.id, typescript.name)]),
          textNode(", and "),
          textNode("capture", [tagMark(capture.id, capture.name)]),
          textNode(" marks."),
        ]),
        paragraph([
          textNode("It also references "),
          textNode("Drizzle", [
            referenceMark(drizzleReference.id, "Drizzle docs"),
          ]),
          textNode(" and "),
          textNode("SQLite", [
            referenceMark(sqliteReference.id, "SQLite docs"),
          ]),
          textNode(" to test reference hover and click behavior."),
        ]),
        paragraph([
          textNode(
            "This is deliberately longer than the other seed notes so card overflow, line spacing, scrolling, and edit/save behavior have something real to chew on instead of three tiny demo sentences pretending to be data.",
          ),
        ]),
      ]),
    }),
    "Renderer Stress Test note",
  );

  console.log("Created notes:", {
    sqljoins,
    drizzleorm,
    sqlite,
    knowledgegraphs,
    backlinks,
    searchqueries,
    captureworkflow,
    orphanNote,
    giantRendererTest,
  });

  console.log("Added tags to notes:", {
    noteTag1: await addTagToNote(user.id, sqljoins.id, database.id),
    noteTag2: await addTagToNote(user.id, sqljoins.id, querying.id),
    noteTag3: await addTagToNote(user.id, drizzleorm.id, typescript.id),
    noteTag4: await addTagToNote(user.id, drizzleorm.id, database.id),
    noteTag5: await addTagToNote(user.id, sqlite.id, database.id),
    noteTag6: await addTagToNote(user.id, knowledgegraphs.id, noteTag.id),
    noteTag7: await addTagToNote(user.id, backlinks.id, noteTag.id),
    noteTag8: await addTagToNote(user.id, searchqueries.id, querying.id),
    noteTag9: await addTagToNote(user.id, captureworkflow.id, capture.id),
    noteTag10: await addTagToNote(user.id, captureworkflow.id, noteTag.id),
    noteTag11: await addTagToNote(user.id, giantRendererTest.id, database.id),
    noteTag12: await addTagToNote(user.id, giantRendererTest.id, typescript.id),
    noteTag13: await addTagToNote(user.id, giantRendererTest.id, capture.id),
    noteTag14: await addTagToNote(user.id, captureworkflow.id, project.id),
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
    noteRef7: await addReferenceToNote({
      noteId: captureworkflow.id,
      referenceId: captureReference.id,
      summary:
        "Used to test Capture-created reference summaries and why-this-matters notes.",
    }),
    noteRef8: await addReferenceToNote({
      noteId: giantRendererTest.id,
      referenceId: drizzleReference.id,
      summary: "Tests multiple references on one rich content note.",
    }),
    noteRef9: await addReferenceToNote({
      noteId: giantRendererTest.id,
      referenceId: sqliteReference.id,
      summary: "Tests reference rendering and hover behavior.",
    }),
  });

  const task1 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: sqljoins.id,
      title: "Review SQL join examples",
      description:
        "Add examples for INNER JOIN, LEFT JOIN, and many-to-many joins.",
      status: "todo",
      priority: "medium",
      dueDate: "2026-05-15",
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
      dueDate: "2026-05-16",
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
      dueDate: "2026-05-01",
    }),
    "task5",
  );

  const task6 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: searchqueries.id,
      title: "Waiting on search UI decision",
      description:
        "Decide whether archived notes should appear in search by default.",
      status: "awaiting",
      priority: "medium",
      dueDate: "2026-05-16",
    }),
    "task6",
  );

  const task7 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: captureworkflow.id,
      title: "Improve Capture reference display",
      description:
        "Show why each suggested reference matters instead of dumping links like a digital junk drawer.",
      status: "todo",
      priority: "high",
      dueDate: "2026-05-18",
    }),
    "task7",
  );

  const task8 = requireSeedValue(
    await createUserTask(user.id, {
      noteId: giantRendererTest.id,
      title: "Archived renderer experiment",
      description:
        "Archived task used to test whether archived items stay hidden until requested.",
      status: "archived",
      priority: "low",
      dueDate: "2026-04-28",
    }),
    "task8",
  );

  console.log("Created tasks:", {
    task1,
    task2,
    task3,
    task4,
    task5,
    task6,
    task7,
    task8,
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
    noteLink5: await createEntityLink({
      createdByUserId: user.id,
      sourceType: "note",
      sourceId: captureworkflow.id,
      targetType: "note",
      targetId: searchqueries.id,
      relationshipType: "uses",
      label: "feeds search",
    }),
    noteLink6: await createEntityLink({
      createdByUserId: user.id,
      sourceType: "note",
      sourceId: captureworkflow.id,
      targetType: "note",
      targetId: knowledgegraphs.id,
      relationshipType: "supports",
      label: "creates structured nodes",
    }),
    noteLink7: await createEntityLink({
      createdByUserId: user.id,
      sourceType: "note",
      sourceId: giantRendererTest.id,
      targetType: "note",
      targetId: captureworkflow.id,
      relationshipType: "related",
      label: "tests rich content",
    }),
  });

  const event1 = await createUserEvent(user.id, {
    noteId: sqljoins.id,
    taskId: task1.id,
    title: "Study SQL joins",
    description:
      "Review SQL join examples and connect them to the SQL Joins note.",
    startDate: "2026-05-15",
    endDate: "2026-05-15",
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
    startDate: "2026-05-16",
    endDate: "2026-05-16",
    startTime: "10:00",
    endTime: "12:00",
    allDay: false,
    location: "Portfolio workspace",
    status: "planned",
  });

  const event3 = await createUserEvent(user.id, {
    title: "Overlapping test event",
    description: "Tests overlapping event layout in the day timeline.",
    startDate: "2026-05-16",
    endDate: "2026-05-16",
    startTime: "11:00",
    endTime: "14:00",
    allDay: false,
    location: "Calendar test",
    status: "planned",
  });

  const event4 = await createUserEvent(user.id, {
    title: "Deep work session",
    description: "Focus on calendar + task integration.",
    startDate: "2026-05-16",
    endDate: "2026-05-16",
    startTime: "13:00",
    endTime: "16:00",
    allDay: false,
    location: "Desk",
    status: "planned",
  });

  const event5 = await createUserEvent(user.id, {
    noteId: knowledgegraphs.id,
    taskId: task4.id,
    title: "Plan knowledge graph map",
    description: "Sketch system connections across notes, tasks, and calendar.",
    startDate: "2026-05-17",
    endDate: "2026-05-17",
    startTime: "14:00",
    endTime: "16:00",
    allDay: false,
    location: "Planning board",
    status: "planned",
  });

  const event6 = await createUserEvent(user.id, {
    noteId: captureworkflow.id,
    taskId: task7.id,
    title: "Polish Capture workflow",
    description:
      "Improve Capture output display so notes, tasks, references, and next steps feel connected.",
    startDate: "2026-05-18",
    endDate: "2026-05-18",
    startTime: "18:00",
    endTime: "19:30",
    allDay: false,
    location: "Portfolio workspace",
    status: "planned",
  });

  const event7 = await createUserEvent(user.id, {
    title: "Feature sprint: Calendar",
    description: "Build event editing, time support, and UI polish.",
    startDate: "2026-05-19",
    endDate: "2026-05-21",
    startTime: "09:00",
    endTime: "17:00",
    allDay: false,
    location: "Workspace",
    status: "planned",
  });

  const event8 = await createUserEvent(user.id, {
    title: "Family day",
    description: "No coding. Try to remember sunlight exists.",
    startDate: "2026-05-24",
    endDate: "2026-05-24",
    allDay: true,
    location: "Outside (allegedly)",
    status: "planned",
  });

  const event9 = await createUserEvent(user.id, {
    noteId: backlinks.id,
    taskId: task5.id,
    title: "Past completed backlink review",
    description: "Past event used to test history and completed work display.",
    startDate: "2026-05-01",
    endDate: "2026-05-01",
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
    location: "Archive test",
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
    event9,
  });

  console.log("Seeding complete.");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
});
