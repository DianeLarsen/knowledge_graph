import { eq } from "drizzle-orm";
import { db } from "../index";
import { tags } from "../schema";

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

