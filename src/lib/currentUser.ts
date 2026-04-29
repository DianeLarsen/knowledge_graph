"use server";

import { getAllUsers } from "@/db/queries/users";

export async function getCurrentUserId() {
  const users = await getAllUsers();

  const user = users[0];

  if (!user) {
    throw new Error("No user found. Run the seed script first.");
  }

  return user.id;
}