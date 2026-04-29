"use server";

import { createReference } from "@/db/queries/references";
import { revalidatePath } from "next/cache";
import { type NewReference } from "@/db/schema";

export async function createReferenceAction(input: NewReference) {
  const reference = await createReference(input);

  revalidatePath("/workspace");
  revalidatePath("/notes");

  return reference;
}