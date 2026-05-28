"use client";

import type { Tag } from "@/db/schema";
import { colorClassMap } from "@/lib/tagColorClasses";
import type { TagColor } from "@/lib/types/tags/tagColors";
import TagCreateInput from "@/components/tags/TagCreateInput";

type AiSuggestedTag = {
  name: string;
  exists: boolean;
};

type EditNoteTagsSectionProps = {
  tags: Tag[];
  currentTags: Tag[];
  selectedNewTagNames: string[];
  otherTags: Tag[];
  aiSuggestedTags: AiSuggestedTag[];
  selectedTagNameSet: Set<string>;
  inlineTagNameSet: Set<string>;

  showAllTags: boolean;
  isSuggestingTags: boolean;
  onNewTagNameChange: (value: string) => void;
  onAddCardLevelTag: () => void;
  handleToggleTag: (tagName: string) => void;
  onAddSuggestedTag: (tagName: string) => void;
  onToggleShowAllTags: () => void;
  onSuggestTags: () => void;
  normalizeTagName: (value: string) => string;
};

export default function EditNoteTagsSection({
  tags,
  currentTags,
  selectedNewTagNames,
  otherTags,
  aiSuggestedTags,
  selectedTagNameSet,
  inlineTagNameSet,
  showAllTags,
  isSuggestingTags,
  onNewTagNameChange,
  onAddCardLevelTag,
  handleToggleTag,
  onAddSuggestedTag,
  onToggleShowAllTags,
  onSuggestTags,
  normalizeTagName,
}: EditNoteTagsSectionProps) {
    
  function renderTagButton(
    tag: Tag,
    variant: "current" | "suggested" | "other",
  ) {
    const tagName = normalizeTagName(tag.name);
    const selected = selectedTagNameSet.has(tagName);
    const isInlineLinked = inlineTagNameSet.has(tagName);

    const color = (tag.color ?? "blue") as TagColor;
    const inlineColorClasses = colorClassMap[color].join(" ");

    const currentClasses = isInlineLinked
      ? `border-current ${inlineColorClasses}`
      : "border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-500 dark:bg-blue-900/40 dark:text-blue-200";

    const suggestedClasses =
      "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200";

    const otherClasses =
      "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";

    const className =
      variant === "current"
        ? currentClasses
        : variant === "suggested"
          ? suggestedClasses
          : otherClasses;

    return (
      <button
        key={tag.id}
        type="button"
        onClick={() => handleToggleTag(tag.name)}
        className={`rounded-full border px-3 py-1 text-sm transition ${className}`}
        title={
          selected
            ? isInlineLinked
              ? "Linked inline and saved on this card"
              : "Saved on this card"
            : variant === "suggested"
              ? "Used inline but not saved as a card tag yet"
              : "Available tag"
        }
      >
        #{tag.name}
      </button>
    );
  }

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[rgb(var(--muted-text))]">
          Tags
        </p>

        <button
          type="button"
          onClick={onSuggestTags}
          disabled={isSuggestingTags}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
        >
          {isSuggestingTags ? "Thinking..." : "Suggest tags"}
        </button>

        <p className="mt-1 text-xs text-gray-400">
          Suggested count: {aiSuggestedTags.length}
        </p>
      </div>

      <div
        className="
    rounded-2xl
    border border-[rgb(var(--border))]
    bg-[rgb(var(--card-muted))]
    p-3 shadow-sm
  "
      >
        <div className="flex flex-wrap gap-2">
          {currentTags.length > 0 || selectedNewTagNames.length > 0 ? (
            <>
              {currentTags.map((tag) => renderTagButton(tag, "current"))}

              {selectedNewTagNames.map((tagName) => (
                <button
                  key={`selected-new-${tagName}`}
                  type="button"
                  onClick={() => handleToggleTag(tagName)}
                  className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                  title="New tag selected for this card"
                >
                  #{tagName}
                  <span className="ml-1 text-xs opacity-70">new</span>
                </button>
              ))}
            </>
          ) : (
            <p className="text-xs text-[rgb(var(--soft-text))]">
              No tags attached yet.
            </p>
          )}
        </div>

        {aiSuggestedTags.length > 0 && (
          <div className="mt-3 border-t border-[rgb(var(--border))]">
            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Suggested
            </p>

            <div className="flex flex-wrap gap-2">
              {aiSuggestedTags.map((tag) => {
                const alreadySelected = selectedTagNameSet.has(
                  normalizeTagName(tag.name),
                );

                return (
                  <button
                    key={`${tag.exists ? "existing" : "new"}-${tag.name}`}
                    type="button"
                    onClick={() => onAddSuggestedTag(tag.name)}
                    disabled={alreadySelected}
                    className={`
                      rounded-full border px-3 py-1 text-xs font-medium transition
                      ${
                        alreadySelected
                          ? "cursor-default border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                          : tag.exists
                            ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                            : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                      }
                    `}
                    title={
                      tag.exists
                        ? "Suggested existing tag"
                        : "Suggested new tag"
                    }
                  >
                    #{tag.name}
                    {!tag.exists && (
                      <span className="ml-1 opacity-70">new</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[rgb(var(--border))]">
          <TagCreateInput
            tags={tags}
            linkedTagNames={selectedTagNameSet}
            existingTagActionLabel="Link existing tag"
            onCreateTag={(tagName) => {
              onNewTagNameChange(tagName);
              onAddCardLevelTag();
            }}
            onUseExistingTag={(tag) => {
              const normalizedExistingTagName = normalizeTagName(tag.name);

              if (selectedTagNameSet.has(normalizedExistingTagName)) {
                return;
              }

              handleToggleTag(tag.name);
            }}
          />

          <button
            type="button"
            onClick={onToggleShowAllTags}
            className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
          >
            {showAllTags ? "Hide all" : `Browse all (${otherTags.length})`}
          </button>
        </div>

        {showAllTags && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-[rgb(var(--border))]">
            {otherTags.length > 0 ? (
              otherTags.map((tag) => renderTagButton(tag, "other"))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No other tags available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
