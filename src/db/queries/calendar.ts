import { and, asc, eq, gte, isNotNull, lte, ne, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { events, tasks, type NewEvent } from "@/db/schema";

export async function getEventsInRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.ownerType, "user"),
        eq(events.ownerId, userId),
        or(
          and(gte(events.startDate, startDate), lte(events.startDate, endDate)),
          and(
            isNotNull(events.endDate),
            gte(events.endDate, startDate),
            lte(events.endDate, endDate),
          ),
          and(
            isNotNull(events.endDate),
            lte(events.startDate, startDate),
            gte(events.endDate, endDate),
          ),
        ),
      ),
    )
    .orderBy(asc(events.startDate));
}

export async function getTasksDueInRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.ownerType, "user"),
        eq(tasks.ownerId, userId),
        ne(tasks.status, "archived"),
        gte(tasks.dueDate, startDate),
        lte(tasks.dueDate, endDate),
      ),
    )
    .orderBy(asc(tasks.dueDate));
}

export async function createEvent(data: NewEvent) {
  const [createdEvent] = await db.insert(events).values(data).returning();
  return createdEvent ?? null;
}

export async function createUserEvent(
  userId: string,
  data: Omit<
    NewEvent,
    "createdByUserId" | "ownerType" | "ownerId" | "visibility"
  >,
) {
  const [createdEvent] = await db
    .insert(events)
    .values({
      ...data,
      createdByUserId: userId,
      ownerType: "user",
      ownerId: userId,
      visibility: "private",
    })
    .returning();

  return createdEvent ?? null;
}

export async function updateEvent(
  eventId: string,
  userId: string,
  data: Partial<NewEvent>,
) {
  const [updatedEvent] = await db
    .update(events)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(events.id, eventId),
        eq(events.ownerType, "user"),
        eq(events.ownerId, userId),
      ),
    )
    .returning();

  return updatedEvent ?? null;
}

export async function deleteEvent(eventId: string, userId: string) {
  const [deletedEvent] = await db
    .delete(events)
    .where(
      and(
        eq(events.id, eventId),
        eq(events.ownerType, "user"),
        eq(events.ownerId, userId),
      ),
    )
    .returning();

  return deletedEvent ?? null;
}

export async function getEventById(eventId: string, userId: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.id, eventId),
        eq(events.ownerType, "user"),
        eq(events.ownerId, userId),
      ),
    );

  return event ?? null;
}

export async function getEventsByUserId(userId: string) {
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.ownerType, "user"),
        eq(events.ownerId, userId),
        isNull(events.deletedAt),
      ),
    )
    .orderBy(asc(events.startDate));
}