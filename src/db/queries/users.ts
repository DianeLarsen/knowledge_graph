import { eq } from "drizzle-orm";
import { db } from "../index";
import { users } from "../schema";

export async function createUser(name: string) {
  const result = await db.insert(users).values({ name }).returning();
  return result[0];
}

export async function getAllUsers() {
  return await db.select().from(users);
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}