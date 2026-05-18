import { createProject, addEntityToProject } from "../queries/projects";
import { requireSeedValue } from "./seedUtils";
import type { SeedNotes } from "./seedNotes";
import type { SeedTasks } from "./seedTasks";
import type { SeedEvents } from "./seedEvents";
import type { SeedReferences } from "./seedReferences";

export async function seedProjects(
  userId: string,
  notes: SeedNotes,
  tasks: SeedTasks,
  events: SeedEvents,
  references: SeedReferences,
) {
  const { knowledgegraphs, sqljoins, captureworkflow, giantRendererTest } =
    notes;
  const { task4, task7, task8 } = tasks;
  const { event5 } = events;
  const { captureReference, drizzleReference } = references;

  const knowledgeGraphProject = requireSeedValue(
    await createProject(userId, {
      title: "Knowledge Graph Portfolio App",
      description:
        "Build and polish the local knowledge graph app with notes, tags, references, tasks, calendar, capture, and projects.",
      status: "active",
      visibility: "private",
    }),
    "Knowledge Graph Portfolio App project",
  );

  const captureSystemProject = requireSeedValue(
    await createProject(userId, {
      title: "Capture Workflow System",
      description:
        "Improve the capture pipeline so messy input becomes useful notes, tasks, references, prompts, risks, and next steps.",
      status: "active",
      visibility: "private",
    }),
    "Capture Workflow System project",
  );

  const rendererProject = requireSeedValue(
    await createProject(userId, {
      title: "Rich Note Renderer Polish",
      description:
        "Test and refine rich content rendering, inline tags, reference marks, scrolling, and card layout behavior.",
      status: "active",
      visibility: "private",
    }),
    "Rich Note Renderer Polish project",
  );

  console.log("Created projects:", {
    knowledgeGraphProject,
    captureSystemProject,
    rendererProject,
  });
  console.log("Added items to projects:", {
    kgNote1: await addEntityToProject(userId, {
      projectId: knowledgeGraphProject.id,
      entityType: "note",
      entityId: knowledgegraphs.id,
      projectRole: "working",
    }),
    kgNote2: await addEntityToProject(userId, {
      projectId: knowledgeGraphProject.id,
      entityType: "note",
      entityId: sqljoins.id,
      projectRole: "source",
    }),
    kgTask1: await addEntityToProject(userId, {
      projectId: knowledgeGraphProject.id,
      entityType: "task",
      entityId: task4.id,
      projectRole: "working",
    }),
    kgEvent1: event5
      ? await addEntityToProject(userId, {
          projectId: knowledgeGraphProject.id,
          entityType: "event",
          entityId: event5.id,
          projectRole: "working",
        })
      : null,

    captureNote: await addEntityToProject(userId, {
      projectId: captureSystemProject.id,
      entityType: "note",
      entityId: captureworkflow.id,
      projectRole: "working",
    }),
    captureTask: await addEntityToProject(userId, {
      projectId: captureSystemProject.id,
      entityType: "task",
      entityId: task7.id,
      projectRole: "working",
    }),
    captureReference: await addEntityToProject(userId, {
      projectId: captureSystemProject.id,
      entityType: "reference",
      entityId: captureReference.id,
      projectRole: "reference",
    }),

    rendererNote: await addEntityToProject(userId, {
      projectId: rendererProject.id,
      entityType: "note",
      entityId: giantRendererTest.id,
      projectRole: "working",
    }),
    rendererTask: await addEntityToProject(userId, {
      projectId: rendererProject.id,
      entityType: "task",
      entityId: task8.id,
      projectRole: "working",
    }),
    rendererReference: await addEntityToProject(userId, {
      projectId: rendererProject.id,
      entityType: "reference",
      entityId: drizzleReference.id,
      projectRole: "reference",
    }),
  });

  return {
    knowledgeGraphProject,
    captureSystemProject,
    rendererProject,
  };
}

export type SeedProjects = Awaited<ReturnType<typeof seedProjects>>;
