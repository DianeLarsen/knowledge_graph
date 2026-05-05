import { eq, count, and, isNull } from "drizzle-orm";
import { db } from "../index";
import { entityTags, notes, tags } from "@/db/schema";

export async function createTag(name: string) {
  const result = await db.insert(tags).values({ name }).returning();
  return result[0];
}

export async function getAllTags() {
  return await db.select().from(tags);
}

export async function getTagById(id: string) {
  const result = await db.select().from(tags).where(eq(tags.id, id));
  return result[0];
}

export async function getTagByName(name: string) {
  const result = await db.select().from(tags).where(eq(tags.name, name));
  return result[0];
}

export async function updateTag(id: string, name: string) {
  const result = await db
    .update(tags)
    .set({ name })
    .where(eq(tags.id, id))
    .returning();

  return result[0];
}

export async function deleteTag(id: string) {
  const result = await db.delete(tags).where(eq(tags.id, id)).returning();
  return result[0];
}

export async function getTagStats(tagId: string, userId: string) {
  const [result] = await db
    .select({
      tagId: tags.id,
      tagName: tags.name,
      noteCount: count(entityTags.entityId),
    })
    .from(tags)
    .leftJoin(
      entityTags,
      and(eq(tags.id, entityTags.tagId), eq(entityTags.entityType, "note")),
    )
    .leftJoin(notes, eq(entityTags.entityId, notes.id))
    .where(
      and(
        eq(tags.id, tagId),
        eq(entityTags.userId, userId),
        eq(notes.userId, userId),
        isNull(notes.deletedAt),
      ),
    )
    .groupBy(tags.id);

  return result ?? null;
}

export async function getTagsForUser(userId: string) {
  return await db
    .selectDistinct({
      id: tags.id,
      name: tags.name,
      createdAt: tags.createdAt,
    })
    .from(tags)
    .innerJoin(entityTags, eq(tags.id, entityTags.tagId))
    .where(eq(entityTags.userId, userId));
}
