"use server";

import { revalidatePath } from "next/cache";
import { attachTagToEntity, removeTagFromEntity } from "@/db/queries/tags";
import { getCurrentUserId } from "@/db/queries/users";
import type { EntityType } from "@/db/schema";
import { entityTypes } from "@/db/schema";

function isEntityType(value: string): value is EntityType {
  return entityTypes.includes(value as EntityType);
}

function revalidateEntityPages(entityType: EntityType, entityId: string) {
  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/capture");
  revalidatePath("/workspace");
  revalidatePath("/notes/references");

  if (entityType === "note") {
    revalidatePath(`/notes/${entityId}`);
  }

  if (entityType === "reference") {
    revalidatePath(`/notes/references/${entityId}`);
  }
}

export async function attachTagToEntityAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const entityTypeValue = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const tagId = String(formData.get("tagId") ?? "");

  if (!isEntityType(entityTypeValue) || !entityId || !tagId) {
    throw new Error("Entity type, entity ID, and tag ID are required.");
  }

  await attachTagToEntity(userId, entityTypeValue, entityId, tagId);
  revalidateEntityPages(entityTypeValue, entityId);
}

export async function removeTagFromEntityAction(formData: FormData) {
  const entityTypeValue = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");
  const tagId = String(formData.get("tagId") ?? "");

  if (!isEntityType(entityTypeValue) || !entityId || !tagId) {
    return;
  }

  await removeTagFromEntity({
    entityType: entityTypeValue,
    entityId,
    tagId,
  });

  revalidateEntityPages(entityTypeValue, entityId);
}
