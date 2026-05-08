import { asc, and, count, eq, isNull, or } from "drizzle-orm";
import { db } from "../index";
import { EntityType, entityTags, notes, tags } from "@/db/schema";
import { getRandomTagColor } from "@/lib/tags/tagColors";

function slugifyTag(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}


export async function createTag(userId: string, name: string) {
  const cleanName = name.trim().toLowerCase();
  const slug = slugifyTag(cleanName);

  const result = await db
    .insert(tags)
    .values({
      createdByUserId: userId,
      scopeType: "user",
      scopeId: userId,
      name: cleanName,
      color: getRandomTagColor(),
      slug,
    })
    .onConflictDoNothing()
    .returning();

  if (result[0]) {
    return result[0];
  }

  return getTagByName(userId, cleanName);
}

export async function getTagsForUser(userId: string) {
  return db
    .select({
      id: tags.id,
      createdByUserId: tags.createdByUserId,
      scopeType: tags.scopeType,
      scopeId: tags.scopeId,
      name: tags.name,
      slug: tags.slug,
      visibility: tags.visibility,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
      deletedAt: tags.deletedAt,
    })
    .from(tags)
    .where(
      and(
        eq(tags.scopeType, "user"),
        eq(tags.scopeId, userId),
        isNull(tags.deletedAt),
      ),
    )
    .orderBy(asc(tags.name));
}

export async function getAvailableTagsForUser(userId: string) {
  return db
    .select({
      id: tags.id,
      createdByUserId: tags.createdByUserId,
      scopeType: tags.scopeType,
      scopeId: tags.scopeId,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
      color: tags.color,
    })
    .from(tags)
    .where(
      and(
        or(
          and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
          eq(tags.scopeType, "public"),
        ),
        isNull(tags.deletedAt),
      ),
    )
    .orderBy(asc(tags.name));
}

export async function getTagById(userId: string, id: string) {
  const result = await db
    .select()
    .from(tags)
    .where(
      and(
        eq(tags.id, id),
        or(
          and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
          eq(tags.scopeType, "public"),
        ),
        isNull(tags.deletedAt),
      ),
    );

  return result[0] ?? null;
}

export async function getTagByName(userId: string, name: string) {
  const slug = slugifyTag(name);

  const result = await db
    .select()
    .from(tags)
    .where(
      and(
        eq(tags.slug, slug),
        and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
        isNull(tags.deletedAt),
      ),
    );

  return result[0] ?? null;
}

export async function updateTag(userId: string, id: string, name: string) {
  const cleanName = name.trim().toLowerCase();
  const slug = slugifyTag(cleanName);

  const result = await db
    .update(tags)
    .set({
      name: cleanName,
      slug,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(tags.id, id),
        eq(tags.scopeType, "user"),
        eq(tags.scopeId, userId),
        eq(tags.createdByUserId, userId),
        isNull(tags.deletedAt),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function deleteTag(userId: string, id: string) {
  const result = await db
    .update(tags)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(tags.id, id),
        eq(tags.scopeType, "user"),
        eq(tags.scopeId, userId),
        eq(tags.createdByUserId, userId),
        isNull(tags.deletedAt),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function getTagsForEntity(
  userId: string,
  entityType: EntityType,
  entityId: string,
) {
  return db
    .select({
      id: tags.id,
      createdByUserId: tags.createdByUserId,
      scopeType: tags.scopeType,
      scopeId: tags.scopeId,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
      color: tags.color,
    })
    .from(entityTags)
    .innerJoin(tags, eq(entityTags.tagId, tags.id))
    .where(
      and(
        eq(entityTags.entityType, entityType),
        eq(entityTags.entityId, entityId),
        or(
          and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
          eq(tags.scopeType, "public"),
        ),
        isNull(tags.deletedAt),
      ),
    )
    .orderBy(asc(tags.name));
}

export async function attachTagToEntity(
  userId: string,
  entityType: EntityType,
  entityId: string,
  tagId: string,
) {
  const tag = await getTagById(userId, tagId);

  if (!tag) {
    throw new Error("Tag not found.");
  }

  await db
    .insert(entityTags)
    .values({
      appliedByUserId: userId,
      entityType,
      entityId,
      tagId,
    })
    .onConflictDoNothing();
}

export async function detachTagFromEntity(
  userId: string,
  entityType: EntityType,
  entityId: string,
  tagId: string,
) {
  const result = await db
    .delete(entityTags)
    .where(
      and(
        eq(entityTags.entityType, entityType),
        eq(entityTags.entityId, entityId),
        eq(entityTags.tagId, tagId),
        eq(entityTags.appliedByUserId, userId),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function getTagStats(tagId: string, userId: string) {
  const [result] = await db
    .select({
      tagId: tags.id,
      tagName: tags.name,
      noteCount: count(notes.id),
    })
    .from(tags)
    .leftJoin(entityTags, eq(tags.id, entityTags.tagId))
    .leftJoin(
      notes,
      and(
        eq(entityTags.entityType, "note"),
        eq(entityTags.entityId, notes.id),
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        isNull(notes.deletedAt),
      ),
    )
    .where(
      and(
        eq(tags.id, tagId),
        or(
          and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
          eq(tags.scopeType, "public"),
        ),
        isNull(tags.deletedAt),
      ),
    )
    .groupBy(tags.id);

  return result ?? null;
}
