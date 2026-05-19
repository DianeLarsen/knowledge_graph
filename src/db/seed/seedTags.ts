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

  const notes = requireSeedValue(await createTag(userId, "notes"), "notes tag");

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

  const react = requireSeedValue(await createTag(userId, "react"), "react tag");

  const nextjs = requireSeedValue(
    await createTag(userId, "nextjs"),
    "nextjs tag",
  );

  const tailwind = requireSeedValue(
    await createTag(userId, "tailwind"),
    "tailwind tag",
  );

  const drizzle = requireSeedValue(
    await createTag(userId, "drizzle"),
    "drizzle tag",
  );

  const clerk = requireSeedValue(await createTag(userId, "clerk"), "clerk tag");

  const api = requireSeedValue(await createTag(userId, "api"), "api tag");

  const auth = requireSeedValue(await createTag(userId, "auth"), "auth tag");

  const ui = requireSeedValue(await createTag(userId, "ui"), "ui tag");

  const ux = requireSeedValue(await createTag(userId, "ux"), "ux tag");

  const testing = requireSeedValue(
    await createTag(userId, "testing"),
    "testing tag",
  );

  const bugs = requireSeedValue(await createTag(userId, "bugs"), "bugs tag");

  const calendar = requireSeedValue(
    await createTag(userId, "calendar"),
    "calendar tag",
  );

  const references = requireSeedValue(
    await createTag(userId, "references"),
    "references tag",
  );

  const tasks = requireSeedValue(await createTag(userId, "tasks"), "tasks tag");

  console.log("Created tags:", {
    database,
    typescript,
    notes,
    querying,
    capture,
    project,
    react,
    nextjs,
    tailwind,
    drizzle,
    clerk,
    api,
    auth,
    ui,
    ux,
    testing,
    bugs,
    calendar,
    references,
    tasks,
  });

  return {
    database,
    typescript,
    notes,
    querying,
    capture,
    project,
    react,
    nextjs,
    tailwind,
    drizzle,
    clerk,
    api,
    auth,
    ui,
    ux,
    testing,
    bugs,
    calendar,
    references,
    tasks,
  };
}

export type SeedTags = Awaited<ReturnType<typeof seedTags>>;
