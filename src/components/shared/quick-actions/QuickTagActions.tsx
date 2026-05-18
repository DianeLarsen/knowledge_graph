"use client";

import { useState } from "react";
import { Tags, Plus } from "lucide-react";
import type { EntityType } from "@/db/schema";
import type { QuickTag } from "@/lib/tags/tagTypes";

import { attachTagToEntityAction } from "@/app/actions/entityTags";

import { createTagAndAttachToEntityAction } from "@/app/actions/quickActions";

type QuickTagActionsProps = {
  entityType: EntityType;
  entityId: string;
  userId: string;
  tags: QuickTag[];
  attachedTagIds: string[];
  inlineTagIds: string[];
  onAttachedTagIdsChange?: (tagIds: string[]) => void;
};

export default function QuickTagActions({
  entityType,
  entityId,
  userId,
  tags,
  attachedTagIds,
  inlineTagIds,
  onAttachedTagIdsChange,
}: QuickTagActionsProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => [
    ...attachedTagIds,
  ]);
  const [newTagName, setNewTagName] = useState("");

  const availableTags = tags.filter(
    (tag) => !selectedTagIds.includes(tag.id) && !inlineTagIds.includes(tag.id),
  );

  const attachedTags = tags.filter(
    (tag) => selectedTagIds.includes(tag.id) || inlineTagIds.includes(tag.id),
  );

  async function handleAttachTag(formData: FormData) {
    const tagId = String(formData.get("tagId") ?? "");

    await attachTagToEntityAction(formData);

    if (!tagId) return;

    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds
      : [...selectedTagIds, tagId];

    setSelectedTagIds(next);
    onAttachedTagIdsChange?.(next);
  }

  async function handleCreateTag(formData: FormData) {
    await createTagAndAttachToEntityAction(formData);
    setNewTagName("");
  }

  return (
    <div className="space-y-3">
      {attachedTags.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-[rgb(var(--muted))]">
            Already attached
          </p>

          <div className="flex flex-wrap gap-2">
            {attachedTags.map((tag) => {
              const isInlineTag = inlineTagIds.includes(tag.id);

              return (
                <span
                  key={tag.id}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    isInlineTag
                      ? "border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-200"
                      : "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200"
                  }`}
                >
                  #{tag.name}
                  {isInlineTag ? " · inline" : ""}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <form action={handleCreateTag} className="mb-3 space-y-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="entityType" value={entityType} />
        <input type="hidden" name="entityId" value={entityId} />

        <input
          name="name"
          required
          value={newTagName}
          onChange={(event) => setNewTagName(event.target.value)}
          placeholder="Create new tag"
          className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))]"
        />

        <button className="flex w-full items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800">
          <Plus size={16} />
          Create and attach tag
        </button>
      </form>

      {availableTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <form key={tag.id} action={handleAttachTag}>
              <input type="hidden" name="entityType" value={entityType} />
              <input type="hidden" name="entityId" value={entityId} />
              <input type="hidden" name="tagId" value={tag.id} />

              <button
                type="submit"
                className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-1 text-xs font-semibold text-[rgb(var(--text))] transition hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                #{tag.name}
              </button>
            </form>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[rgb(var(--muted))]">
          No unlinked tags available.
        </p>
      )}
    </div>
  );
}
