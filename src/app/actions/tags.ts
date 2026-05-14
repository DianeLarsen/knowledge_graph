"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { getCurrentUserId } from "@/db/queries/users";

function normalizeTagName(value: string) {
  return value.trim().replace(/^#+/, "").trim();
}

function slugify(value: string) {
  return normalizeTagName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createTagAction(formData: FormData) {
  const rawName = String(formData.get("name") ?? "");
  const name = normalizeTagName(rawName);

  if (!name) return;

  const userId = await getCurrentUserId();

  await db
    .insert(tags)
    .values({
      name,
      slug: slugify(name),
      createdByUserId: userId,
      scopeType: "user",
      scopeId: userId,
    })
    .onConflictDoNothing();

  revalidatePath("/notes");
  revalidatePath("/workspace");
}