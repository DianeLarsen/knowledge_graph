import { createUserReference } from "../queries/references";
import { requireSeedValue } from "./seedUtils";

export async function seedReferences(userId: string) {
  const sqlReference = requireSeedValue(
    await createUserReference(userId, {
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
    await createUserReference(userId, {
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
    await createUserReference(userId, {
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
    await createUserReference(userId, {
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
    await createUserReference(userId, {
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

  return {
    sqlReference,
    drizzleReference,
    sqliteReference,
    graphReference,
    captureReference,
  };
}

export type SeedReferences = Awaited<ReturnType<typeof seedReferences>>;
