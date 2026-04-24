import { notes } from "../schema";
import { db } from "../index";
import { eq, sql } from 'drizzle-orm';


export async function createNote(title: string, content: string) {
  const result = await db
    .insert(notes)
    .values({ title, content })
    .returning();
  return result[0];
} 

export async function getAllNotes() {
  return await db.select().from(notes).where(sql`${notes.deletedAt} IS NULL`);;
}

export async function getNoteById(id: string) {
  const result = await db.select().from(notes).where(eq(notes.id, id));
  return result[0];
}

export async function updateNote(id: string, title: string, content: string) {
  const result = await db
    .update(notes)
    .set({ title, content })
    .where(eq(notes.id, id))
    .returning();
  return result[0];
}

export async function deleteNote(id: string) {
  const result = await db
    .update(notes)
    .set({ deletedAt: new Date() })
    .where(eq(notes.id, id))
    .returning();
  return result[0];
}