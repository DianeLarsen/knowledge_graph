import { eq, count } from "drizzle-orm";
import { db } from "../index";
import { notes, tags, noteTags } from "@/db/schema";

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

export async function getTagStats(tagId: string) {
  const result = await db
    .select({
      tagId: tags.id,
      tagName: tags.name,
      noteCount: count(notes.id),
    })
    .from(tags)
    .leftJoin(noteTags, eq(tags.id, noteTags.tagId))
    .leftJoin(notes, eq(noteTags.noteId, notes.id))
    .where(eq(tags.id, tagId))
    .groupBy(tags.id, tags.name);

  return result[0] ?? null;
}

export async function getTagsByUser(userId: string) {
  return await db
    .selectDistinct({
      id: tags.id,
      name: tags.name,
      createdAt: tags.createdAt,
    })
    .from(tags)
    .innerJoin(noteTags, eq(tags.id, noteTags.tagId))
    .innerJoin(notes, eq(noteTags.noteId, notes.id))
    .where(eq(notes.userId, userId));
}

