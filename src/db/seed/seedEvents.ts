import { createUserEvent } from "../queries/calendar";
import { requireSeedValue } from "./seedUtils";
import type { SeedNotes } from "./seedNotes";
import type { SeedTasks } from "./seedTasks";

export async function seedEvents(
  userId: string,
  notes: SeedNotes,
  tasks: SeedTasks,
) {
  const { sqljoins, drizzleorm, knowledgegraphs, captureworkflow, backlinks } =
    notes;

  const { task1, task2, task4, task5, task7 } = tasks;

  const event1 = requireSeedValue(
    await createUserEvent(userId, {
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
    }),
    "event1",
  );

  const event2 = requireSeedValue(
    await createUserEvent(userId, {
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
    }),
    "event2",
  );

  const event3 = requireSeedValue(
    await createUserEvent(userId, {
      title: "Overlapping test event",
      description: "Tests overlapping event layout in the day timeline.",
      startDate: "2026-05-16",
      endDate: "2026-05-16",
      startTime: "11:00",
      endTime: "14:00",
      allDay: false,
      location: "Calendar test",
      status: "planned",
    }),
    "event3",
  );

  const event4 = requireSeedValue(
    await createUserEvent(userId, {
      title: "Deep work session",
      description: "Focus on calendar + task integration.",
      startDate: "2026-05-16",
      endDate: "2026-05-16",
      startTime: "13:00",
      endTime: "16:00",
      allDay: false,
      location: "Desk",
      status: "planned",
    }),
    "event4",
  );

  const event5 = requireSeedValue(
    await createUserEvent(userId, {
      noteId: knowledgegraphs.id,
      taskId: task4.id,
      title: "Plan knowledge graph map",
      description:
        "Sketch system connections across notes, tasks, and calendar.",
      startDate: "2026-05-17",
      endDate: "2026-05-17",
      startTime: "14:00",
      endTime: "16:00",
      allDay: false,
      location: "Planning board",
      status: "planned",
    }),
    "event5",
  );

  const event6 = requireSeedValue(
    await createUserEvent(userId, {
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
    }),
    "event6",
  );

  const event7 = requireSeedValue(
    await createUserEvent(userId, {
      title: "Feature sprint: Calendar",
      description: "Build event editing, time support, and UI polish.",
      startDate: "2026-05-19",
      endDate: "2026-05-21",
      startTime: "09:00",
      endTime: "17:00",
      allDay: false,
      location: "Workspace",
      status: "planned",
    }),
    "event7",
  );

  const event8 = requireSeedValue(
    await createUserEvent(userId, {
      title: "Family day",
      description: "No coding. Try to remember sunlight exists.",
      startDate: "2026-05-24",
      endDate: "2026-05-24",
      allDay: true,
      location: "Outside (allegedly)",
      status: "planned",
    }),
    "event8",
  );

  const event9 = requireSeedValue(
    await createUserEvent(userId, {
      noteId: backlinks.id,
      taskId: task5.id,
      title: "Past completed backlink review",
      description:
        "Past event used to test history and completed work display.",
      startDate: "2026-05-01",
      endDate: "2026-05-01",
      startTime: "09:00",
      endTime: "10:00",
      allDay: false,
      location: "Archive test",
      status: "planned",
    }),
    "event9",
  );

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

  return {
    event1,
    event2,
    event3,
    event4,
    event5,
    event6,
    event7,
    event8,
    event9,
  };
}

export type SeedEvents = Awaited<ReturnType<typeof seedEvents>>;
