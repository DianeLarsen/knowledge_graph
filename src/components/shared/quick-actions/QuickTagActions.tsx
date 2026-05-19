"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { EntityType } from "@/db/schema";
import type { QuickTag } from "@/lib/types/quickTypes";

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
  tagSuggestionText?: string;
};

export default function QuickTagActions({
  entityType,
  entityId,
  userId,
  tags,
  attachedTagIds,
  inlineTagIds,
  onAttachedTagIdsChange,
  tagSuggestionText = "",
}: QuickTagActionsProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => [
    ...attachedTagIds,
  ]);
  const [newTagName, setNewTagName] = useState("");
  const [showTagBrowser, setShowTagBrowser] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const availableTags = tags.filter(
    (tag) => !selectedTagIds.includes(tag.id) && !inlineTagIds.includes(tag.id),
  );
  const normalizedSuggestionText = tagSuggestionText.toLowerCase();

  function scoreTag(tag: QuickTag) {
    const tagName = tag.name.toLowerCase();
    let score = 0;

    if (normalizedSuggestionText.includes(tagName)) {
      score += 10;
    }

    const tagWords = tagName.split(/[\s-_]+/);

    for (const word of tagWords) {
      if (word.length > 2 && normalizedSuggestionText.includes(word)) {
        score += 3;
      }
    }

    if (tagName === entityType) {
      score += 4;
    }

    if (
      (entityType === "note" &&
        ["notes", "writing", "reference"].includes(tagName)) ||
      (entityType === "task" &&
        ["tasks", "project", "testing"].includes(tagName)) ||
      (entityType === "reference" &&
        ["references", "research", "notes"].includes(tagName)) ||
      (entityType === "capture" &&
        ["capture", "notes", "tasks"].includes(tagName)) ||
      (entityType === "event" &&
        ["calendar", "project", "tasks"].includes(tagName))
    ) {
      score += 2;
    }

    return score;
  }

  const suggestedTags = [...availableTags]
    .map((tag) => ({
      tag,
      score: scoreTag(tag),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.tag.name.localeCompare(b.tag.name);
    })
    .slice(0, 8)
    .map((item) => item.tag);

  const searchedTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase().trim()),
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

  function TagAttachButton({ tag }: { tag: QuickTag }) {
    return (
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
    );
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
        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[rgb(var(--muted))]">
                Suggested tags
              </p>

              {availableTags.length > suggestedTags.length && (
                <button
                  type="button"
                  onClick={() => setShowTagBrowser(true)}
                  className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
                >
                  Browse all {availableTags.length}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <TagAttachButton key={tag.id} tag={tag} />
              ))}
            </div>
          </div>

          {showTagBrowser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-xl">
                <div className="flex items-start justify-between gap-3 border-b border-[rgb(var(--border))] p-4">
                  <div>
                    <h3 className="text-sm font-bold text-[rgb(var(--text))]">
                      Browse tags
                    </h3>
                    <p className="text-xs text-[rgb(var(--muted))]">
                      Search and attach existing tags.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTagBrowser(false)}
                    className="rounded-lg px-2 py-1 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  <input
                    value={tagSearch}
                    onChange={(event) => setTagSearch(event.target.value)}
                    placeholder="Search tags..."
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))]"
                  />

                  <div className="max-h-80 overflow-y-auto pr-1">
                    {searchedTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {searchedTags.map((tag) => (
                          <TagAttachButton key={tag.id} tag={tag} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[rgb(var(--muted))]">
                        No tags match that search.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-[rgb(var(--muted))]">
          No unlinked tags available.
        </p>
      )}
    </div>
  );
}
