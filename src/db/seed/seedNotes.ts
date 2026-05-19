import { createNote } from "../queries/notes";
import { addTagToNote } from "../queries/entitytags";
import {
  highlightMark,
  makeContentJson,
  paragraph,
  referenceMark,
  requireSeedValue,
  tagMark,
  textNode,
} from "./seedUtils";
import type { SeedTags } from "./seedTags";
import type { SeedReferences } from "./seedReferences";

export async function seedNotes(
  userId: string,
  seedTags: SeedTags,
  seedReferences: SeedReferences,
) {
const { database, typescript, notes, querying, capture, project } = seedTags;
  const {
    sqlReference,
    drizzleReference,
    sqliteReference,
    graphReference,
    captureReference,
  } = seedReferences;

  const sqljoins = requireSeedValue(
    await createNote({
      userId: userId,
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
      userId: userId,
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
      userId: userId,
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
      userId: userId,
      title: "Knowledge Graphs",
      content: "Knowledge graphs connect ideas using nodes and relationships.",
      contentJson: makeContentJson([
        paragraph([
          textNode("Knowledge graphs connect ideas using "),
          textNode("nodes and relationships", [
            tagMark(notes.id, notes.name),
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
      userId: userId,
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
      userId: userId,
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
      userId: userId,
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
          textNode("notes", [tagMark(notes.id, notes.name)]),
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
      userId: userId,
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
      userId: userId,
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

  console.log("Added tags to notes:", {
    noteTag1: await addTagToNote(userId, sqljoins.id, database.id),
    noteTag2: await addTagToNote(userId, sqljoins.id, querying.id),
    noteTag3: await addTagToNote(userId, drizzleorm.id, typescript.id),
    noteTag4: await addTagToNote(userId, drizzleorm.id, database.id),
    noteTag5: await addTagToNote(userId, sqlite.id, database.id),
    noteTag6: await addTagToNote(userId, knowledgegraphs.id, notes.id),
    noteTag7: await addTagToNote(userId, backlinks.id, notes.id),
    noteTag8: await addTagToNote(userId, searchqueries.id, querying.id),
    noteTag9: await addTagToNote(userId, captureworkflow.id, capture.id),
    noteTag10: await addTagToNote(userId, captureworkflow.id, notes.id),
    noteTag11: await addTagToNote(userId, giantRendererTest.id, database.id),
    noteTag12: await addTagToNote(userId, giantRendererTest.id, typescript.id),
    noteTag13: await addTagToNote(userId, giantRendererTest.id, capture.id),
    noteTag14: await addTagToNote(userId, captureworkflow.id, project.id),
  });

  return {
    sqljoins,
    drizzleorm,
    sqlite,
    knowledgegraphs,
    backlinks,
    searchqueries,
    captureworkflow,
    orphanNote,
    giantRendererTest,
  };
}

export type SeedNotes = Awaited<ReturnType<typeof seedNotes>>;
