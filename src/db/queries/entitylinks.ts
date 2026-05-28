import { and, eq, isNull } from "drizzle-orm";
import { db } from "../index";
import {
  entityLinks,
  notes,
  tasks,
  events,
  projects,
  type EntityType,
  type NewEntityLink,
  type RelationshipType,
} from "../schema";

export async function createEntityLink(data: NewEntityLink) {
  const [result] = await db
    .insert(entityLinks)
    .values(data)
    .onConflictDoNothing()
    .returning();

  return result ?? null;
}

export async function deleteEntityLink({
  userId,
  sourceType,
  sourceId,
  targetType,
  targetId,
  relationshipType,
}: {
  userId: string;
  sourceType: EntityType;
  sourceId: string;
  targetType: EntityType;
  targetId: string;
  relationshipType?: RelationshipType;
}) {
  const conditions = [
    eq(entityLinks.createdByUserId, userId),
    eq(entityLinks.sourceType, sourceType),
    eq(entityLinks.sourceId, sourceId),
    eq(entityLinks.targetType, targetType),
    eq(entityLinks.targetId, targetId),
  ];

  if (relationshipType) {
    conditions.push(eq(entityLinks.relationshipType, relationshipType));
  }

  return db
    .delete(entityLinks)
    .where(and(...conditions))
    .returning();
}

export async function deleteEntityLinksForSource({
  userId,
  sourceType,
  sourceId,
}: {
  userId: string;
  sourceType: EntityType;
  sourceId: string;
}) {
  return db
    .delete(entityLinks)
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        eq(entityLinks.sourceType, sourceType),
        eq(entityLinks.sourceId, sourceId),
      ),
    )
    .returning();
}

export async function deleteEntityLinksForTarget({
  userId,
  targetType,
  targetId,
}: {
  userId: string;
  targetType: EntityType;
  targetId: string;
}) {
  return db
    .delete(entityLinks)
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        eq(entityLinks.targetType, targetType),
        eq(entityLinks.targetId, targetId),
      ),
    )
    .returning();
}

export async function getOutgoingLinks(noteId: string, userId: string) {
  const rows = await db
    .select({
      id: entityLinks.id,
      createdByUserId: entityLinks.createdByUserId,
      relationshipType: entityLinks.relationshipType,
      label: entityLinks.label,
      metadata: entityLinks.metadata,
      sourceType: entityLinks.sourceType,
      sourceId: entityLinks.sourceId,
      targetType: entityLinks.targetType,
      targetId: entityLinks.targetId,

      targetNoteId: notes.id,
      targetNoteTitle: notes.title,
      targetNoteContent: notes.content,
      targetNoteContentJson: notes.contentJson,
      targetNoteUpdatedAt: notes.updatedAt,

      targetTaskId: tasks.id,
      targetTaskTitle: tasks.title,
      targetTaskDescription: tasks.description,
      targetTaskStatus: tasks.status,
      targetTaskPriority: tasks.priority,

      targetEventId: events.id,
      targetEventTitle: events.title,
      targetEventDescription: events.description,
      targetEventStatus: events.status,
      targetEventStartDate: events.startDate,
      targetEventEndDate: events.endDate,
      targetEventAllDay: events.allDay,
      targetEventLocation: events.location,

      targetProjectId: projects.id,
      targetProjectTitle: projects.title,
      targetProjectDescription: projects.description,
    })
    .from(entityLinks)
    .leftJoin(
      notes,
      and(
        eq(entityLinks.targetType, "note"),
        eq(entityLinks.targetId, notes.id),
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        isNull(notes.deletedAt),
      ),
    )
    .leftJoin(
      tasks,
      and(
        eq(entityLinks.targetType, "task"),
        eq(entityLinks.targetId, tasks.id),
        eq(tasks.ownerType, "user"),
        eq(tasks.ownerId, userId),
      ),
    )
    .leftJoin(
      events,
      and(
        eq(entityLinks.targetType, "event"),
        eq(entityLinks.targetId, events.id),
        eq(events.ownerType, "user"),
        eq(events.ownerId, userId),
      ),
    )
    .leftJoin(
      projects,
      and(
        eq(entityLinks.targetType, "project"),
        eq(entityLinks.targetId, projects.id),
        eq(projects.ownerId, userId),
      ),
    )
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        eq(entityLinks.sourceType, "note"),
        eq(entityLinks.sourceId, noteId),
      ),
    );

  return rows
    .filter((row) => {
      if (row.targetType === "note") return !!row.targetNoteId;
      if (row.targetType === "task") return !!row.targetTaskId;
      if (row.targetType === "event") return !!row.targetEventId;
      if (row.targetType === "project") return !!row.targetProjectId;
      return false;
    })
    .map((row) => ({
      ...row,
      targetTitle:
        row.targetNoteTitle ??
        row.targetTaskTitle ??
        row.targetEventTitle ??
        row.targetProjectTitle ??
        null,

      targetNote:
        row.targetType === "note"
          ? {
              id: row.targetNoteId!,
              title: row.targetNoteTitle,
              content: row.targetNoteContent,
              contentJson: row.targetNoteContentJson,
              updatedAt: row.targetNoteUpdatedAt,
            }
          : null,

      targetTask:
        row.targetType === "task"
          ? {
              id: row.targetTaskId!,
              title: row.targetTaskTitle,
              description: row.targetTaskDescription,
              status: row.targetTaskStatus,
              priority: row.targetTaskPriority,
            }
          : null,

      targetEvent:
        row.targetType === "event"
          ? {
              id: row.targetEventId!,
              title: row.targetEventTitle,
              description: row.targetEventDescription,
              status: row.targetEventStatus,
              startDate: row.targetEventStartDate,
              endDate: row.targetEventEndDate,
              allDay: row.targetEventAllDay,
              location: row.targetEventLocation,
            }
          : null,

      targetProject:
        row.targetType === "project"
          ? {
              id: row.targetProjectId!,
              title: row.targetProjectTitle,
              description: row.targetProjectDescription,
            }
          : null,
    }));
}

export async function getBacklinks(noteId: string, userId: string) {
  const rows = await db
    .select({
      id: entityLinks.id,
      createdByUserId: entityLinks.createdByUserId,
      relationshipType: entityLinks.relationshipType,
      label: entityLinks.label,
      metadata: entityLinks.metadata,
      sourceType: entityLinks.sourceType,
      sourceId: entityLinks.sourceId,
      targetType: entityLinks.targetType,
      targetId: entityLinks.targetId,

      sourceNoteId: notes.id,
      sourceNoteTitle: notes.title,
      sourceNoteContent: notes.content,
      sourceNoteContentJson: notes.contentJson,
      sourceNoteUpdatedAt: notes.updatedAt,

      sourceTaskId: tasks.id,
      sourceTaskTitle: tasks.title,
      sourceTaskDescription: tasks.description,
      sourceTaskStatus: tasks.status,
      sourceTaskPriority: tasks.priority,

      sourceEventId: events.id,
      sourceEventTitle: events.title,
      sourceEventDescription: events.description,
      sourceEventStatus: events.status,
      sourceEventStartDate: events.startDate,
      sourceEventEndDate: events.endDate,
      sourceEventAllDay: events.allDay,
      sourceEventLocation: events.location,

      sourceProjectId: projects.id,
      sourceProjectTitle: projects.title,
      sourceProjectDescription: projects.description,
    })
    .from(entityLinks)
    .leftJoin(
      notes,
      and(
        eq(entityLinks.sourceType, "note"),
        eq(entityLinks.sourceId, notes.id),
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        isNull(notes.deletedAt),
      ),
    )
    .leftJoin(
      tasks,
      and(
        eq(entityLinks.sourceType, "task"),
        eq(entityLinks.sourceId, tasks.id),
        eq(tasks.ownerType, "user"),
        eq(tasks.ownerId, userId),
      ),
    )
    .leftJoin(
      events,
      and(
        eq(entityLinks.sourceType, "event"),
        eq(entityLinks.sourceId, events.id),
        eq(events.ownerType, "user"),
        eq(events.ownerId, userId),
      ),
    )
    .leftJoin(
      projects,
      and(
        eq(entityLinks.sourceType, "project"),
        eq(entityLinks.sourceId, projects.id),
        eq(projects.ownerId, userId),
      ),
    )
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        eq(entityLinks.targetType, "note"),
        eq(entityLinks.targetId, noteId),
      ),
    );

  return rows
    .filter((row) => {
      if (row.sourceType === "note") return !!row.sourceNoteId;
      if (row.sourceType === "task") return !!row.sourceTaskId;
      if (row.sourceType === "event") return !!row.sourceEventId;
      if (row.sourceType === "project") return !!row.sourceProjectId;
      return false;
    })
    .map((row) => ({
      ...row,
      sourceTitle:
        row.sourceNoteTitle ??
        row.sourceTaskTitle ??
        row.sourceEventTitle ??
        row.sourceProjectTitle ??
        null,

      sourceNote:
        row.sourceType === "note"
          ? {
              id: row.sourceNoteId!,
              title: row.sourceNoteTitle,
              content: row.sourceNoteContent,
              contentJson: row.sourceNoteContentJson,
              updatedAt: row.sourceNoteUpdatedAt,
            }
          : null,

      sourceTask:
        row.sourceType === "task"
          ? {
              id: row.sourceTaskId!,
              title: row.sourceTaskTitle,
              description: row.sourceTaskDescription,
              status: row.sourceTaskStatus,
              priority: row.sourceTaskPriority,
            }
          : null,

      sourceEvent:
        row.sourceType === "event"
          ? {
              id: row.sourceEventId!,
              title: row.sourceEventTitle,
              description: row.sourceEventDescription,
              status: row.sourceEventStatus,
              startDate: row.sourceEventStartDate,
              endDate: row.sourceEventEndDate,
              allDay: row.sourceEventAllDay,
              location: row.sourceEventLocation,
            }
          : null,

      sourceProject:
        row.sourceType === "project"
          ? {
              id: row.sourceProjectId!,
              title: row.sourceProjectTitle,
              description: row.sourceProjectDescription,
            }
          : null,
    }));
}