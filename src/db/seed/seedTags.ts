import { createTag } from "../queries/tags";
import { requireSeedValue } from "./seedUtils";

export async function seedTags(userId: string) {
  const database = requireSeedValue(
    await createTag(userId, "database"),
    "database tag",
  );

  const typescript = requireSeedValue(
    await createTag(userId, "typescript"),
    "typescript tag",
  );

  const noteTag = requireSeedValue(
    await createTag(userId, "notes"),
    "notes tag",
  );

  const querying = requireSeedValue(
    await createTag(userId, "querying"),
    "querying tag",
  );

  const capture = requireSeedValue(
    await createTag(userId, "capture"),
    "capture tag",
  );

  const project = requireSeedValue(
    await createTag(userId, "project"),
    "project tag",
  );

  console.log("Created tags:", {
    database,
    typescript,
    noteTag,
    querying,
    capture,
    project,
  });

  return {
    database,
    typescript,
    noteTag,
    querying,
    capture,
    project,
  };
}

export type SeedTags = Awaited<ReturnType<typeof seedTags>>;
