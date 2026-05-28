"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { getCurrentUserId } from "@/db/queries/users";
import { getNoteById, updateNoteContentOnly } from "@/db/queries/notes";
import { detachTagFromEntity } from "@/db/queries/entitytags";

type TipTapMark = {
  type: string;
  attrs?: {
    tagId?: string;
    tagName?: string;
    [key: string]: unknown;
  };
};

type TipTapNode = {
  type?: string;
  text?: string;
  marks?: TipTapMark[];
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
};

function normalizeTagName(value: string) {
  return value.trim().replace(/^#+/, "").trim();
}

function slugify(value: string) {
  return normalizeTagName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractPlainTextFromTipTap(
  node: TipTapNode | null | undefined,
): string {
  if (!node) return "";

  let text = "";

  if (typeof node.text === "string") {
    text += node.text;
  }

  if (Array.isArray(node.content)) {
    text += node.content.map(extractPlainTextFromTipTap).join(" ");
  }

  return text.replace(/\s+/g, " ").trim();
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

export async function removeInlineTagAndDetachAction({
  noteId,
  tagId,
  tagName,
}: {
  noteId: string;
  tagId: string;
  tagName: string;
}) {
  const userId = await getCurrentUserId();

  const note = await getNoteById(noteId);

  if (!note?.contentJson) return null;

  const parsed = JSON.parse(note.contentJson) as TipTapNode;
  const targetName = tagName.toLowerCase();

  function stripTagMarks(node: TipTapNode): TipTapNode {
    const next: TipTapNode = { ...node };

    if (Array.isArray(next.marks)) {
      next.marks = next.marks.filter((mark) => {
        if (mark.type !== "tagMark") return true;

        const markTagId = mark.attrs?.tagId;
        const markTagName = mark.attrs?.tagName?.toLowerCase();

        return !(markTagId === tagId || markTagName === targetName);
      });

      if (next.marks.length === 0) {
        delete next.marks;
      }
    }

    if (Array.isArray(next.content)) {
      next.content = next.content.map(stripTagMarks);
    }

    return next;
  }

  const updatedJson = stripTagMarks(parsed);
  const updatedContentJson = JSON.stringify(updatedJson);
  const updatedContent = extractPlainTextFromTipTap(updatedJson);

  await updateNoteContentOnly({
    userId,
    noteId,
    content: updatedContent,
    contentJson: updatedContentJson,
  });

  await detachTagFromEntity({
    userId,
    entityType: "note",
    entityId: noteId,
    tagId,
  });

  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/notes");

  return { success: true };
}
