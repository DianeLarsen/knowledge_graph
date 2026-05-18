import { createEntityLink } from "../queries/entitylinks";
import type { SeedNotes } from "./seedNotes";
import type { SeedReferences } from "./seedReferences";

export async function seedLinks(
  userId: string,
  notes: SeedNotes,
  references: SeedReferences,
) {
  const {
    sqljoins,
    drizzleorm,
    sqlite,
    knowledgegraphs,
    backlinks,
    searchqueries,
    captureworkflow,
    giantRendererTest,
  } = notes;

  const {
    sqlReference,
    drizzleReference,
    sqliteReference,
    graphReference,
    captureReference,
  } = references;

  console.log("Linked references to notes:", {
    refLink1: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: sqljoins.id,
      targetType: "reference",
      targetId: sqlReference.id,
      relationshipType: "references",
      label: "SQL joins reference",
    }),
    refLink2: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: drizzleorm.id,
      targetType: "reference",
      targetId: drizzleReference.id,
      relationshipType: "references",
      label: "Drizzle docs",
    }),
    refLink3: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: sqlite.id,
      targetType: "reference",
      targetId: sqliteReference.id,
      relationshipType: "references",
      label: "SQLite docs",
    }),
    refLink4: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: knowledgegraphs.id,
      targetType: "reference",
      targetId: graphReference.id,
      relationshipType: "references",
      label: "Knowledge graph concepts",
    }),
    refLink5: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: captureworkflow.id,
      targetType: "reference",
      targetId: captureReference.id,
      relationshipType: "references",
      label: "Capture planning",
    }),
    refLink6: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: giantRendererTest.id,
      targetType: "reference",
      targetId: drizzleReference.id,
      relationshipType: "references",
      label: "Renderer Drizzle reference",
    }),
    refLink7: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: giantRendererTest.id,
      targetType: "reference",
      targetId: sqliteReference.id,
      relationshipType: "references",
      label: "Renderer SQLite reference",
    }),
  });

  console.log("Created note links:", {
    noteLink1: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: sqljoins.id,
      targetType: "note",
      targetId: drizzleorm.id,
      relationshipType: "supports",
    }),
    noteLink2: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: sqljoins.id,
      targetType: "note",
      targetId: sqlite.id,
      relationshipType: "uses",
    }),
    noteLink3: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: drizzleorm.id,
      targetType: "note",
      targetId: knowledgegraphs.id,
      relationshipType: "related",
      label: "explains",
    }),
    noteLink4: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: sqlite.id,
      targetType: "note",
      targetId: backlinks.id,
      relationshipType: "related",
    }),
    noteLink5: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: captureworkflow.id,
      targetType: "note",
      targetId: searchqueries.id,
      relationshipType: "uses",
      label: "feeds search",
    }),
    noteLink6: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: captureworkflow.id,
      targetType: "note",
      targetId: knowledgegraphs.id,
      relationshipType: "supports",
      label: "creates structured nodes",
    }),
    noteLink7: await createEntityLink({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: giantRendererTest.id,
      targetType: "note",
      targetId: captureworkflow.id,
      relationshipType: "related",
      label: "tests rich content",
    }),
  });
}
