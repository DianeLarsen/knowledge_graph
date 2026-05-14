"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { entityLinks } from "@/db/schema";
import { getCurrentUserId } from "@/db/queries/users";
import type { EntityType, RelationshipType } from "@/db/schema";

export async function createEntityLinkAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const sourceType = String(formData.get("sourceType") ?? "") as EntityType;
  const sourceId = String(formData.get("sourceId") ?? "");
  const targetType = String(formData.get("targetType") ?? "") as EntityType;
  const targetId = String(formData.get("targetId") ?? "");
  const relationshipType = String(
    formData.get("relationshipType") ?? "related",
  ) as RelationshipType;

  if (!sourceType || !sourceId || !targetType || !targetId) {
    throw new Error("Source and target are required.");
  }

  await db
    .insert(entityLinks)
    .values({
      createdByUserId: userId,
      sourceType,
      sourceId,
      targetType,
      targetId,
      relationshipType,
    })
    .onConflictDoNothing();

  revalidatePath("/");
  revalidatePath(`/${sourceType}s`);
  revalidatePath(`/${targetType}s`);
}
