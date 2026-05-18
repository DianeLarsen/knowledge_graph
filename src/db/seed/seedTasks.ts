import { createUserTask } from "../queries/tasks";
import { requireSeedValue } from "./seedUtils";
import type { SeedNotes } from "./seedNotes";

export async function seedTasks(userId: string, notes: SeedNotes) {
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

  const task1 = requireSeedValue(
    await createUserTask(userId, {
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
    await createUserTask(userId, {
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
    await createUserTask(userId, {
      noteId: sqlite.id,
      title: "Document SQLite reset behavior",
      description: "Explain delete order and foreign key constraints.",
      status: "todo",
      priority: "medium",
    }),
    "task3",
  );

  const task4 = requireSeedValue(
    await createUserTask(userId, {
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
    await createUserTask(userId, {
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
    await createUserTask(userId, {
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
    await createUserTask(userId, {
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
    await createUserTask(userId, {
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

  return {
    task1,
    task2,
    task3,
    task4,
    task5,
    task6,
    task7,
    task8,
  };
}

export type SeedTasks = Awaited<ReturnType<typeof seedTasks>>;
