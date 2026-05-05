import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .then((res) => res[0]);

  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();

  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    "";

  const name =
    clerkUser?.fullName ?? clerkUser?.firstName ?? email ?? "Unnamed User";

  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: userId,
      name,
      email,
    })
    .returning();

  return newUser;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user.id;
}

export async function createUser(input: {
  name: string;
  email: string;
  clerkId: string;
}) {
  const [result] = await db.insert(users).values(input).returning();
  return result;
}

export async function getAllUsers() {
  return await db.select().from(users);
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}
