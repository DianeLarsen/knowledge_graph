"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Tag } from "@/db/schema";
import { normalizeTagName, normalizeTagSlug } from "@/components/tags/tagUtils";

type TagCreateInputProps = {
  tags: Tag[];
  linkedTagNames?: Set<string>;
  placeholder?: string;
  buttonLabel?: string;
  onCreateTag: (tagName: string, formData?: FormData) => void | Promise<void>;
  useFormAction?: boolean;
  onUseExistingTag?: (tag: Tag) => void;
  existingTagActionLabel?: string;
};

export default function TagCreateInput({
  tags,
  linkedTagNames = new Set(),
  placeholder = "add tag",
  onCreateTag,
  useFormAction = false,
  onUseExistingTag,
  existingTagActionLabel = "Link Existing Tag",
}: TagCreateInputProps) {
  const [tagName, setTagName] = useState("");

  const [duplicateTag, setDuplicateTag] = useState<Tag | null>(null);
  const duplicateTagName = duplicateTag
    ? normalizeTagName(duplicateTag.name)
    : "";

  const duplicateAlreadyLinked =
    !!duplicateTag && linkedTagNames.has(duplicateTagName);

  const normalized = normalizeTagName(tagName);
  const normalizedSlug = normalizeTagSlug(tagName);

  function getDuplicateTag() {
    return tags.find((tag) => normalizeTagSlug(tag.name) === normalizedSlug);
  }

  async function handleCreate(formData?: FormData) {
    const existingTag = getDuplicateTag();

    if (existingTag) {
      setDuplicateTag(existingTag);
      return;
    }

    await onCreateTag(normalized, formData);
    setDuplicateTag(null);
    setTagName("");
  }

  return (
    <div className="mt-2">
      <form
        action={
          useFormAction
            ? async (formData) => {
                await handleCreate(formData);
              }
            : undefined
        }
        onSubmit={
          useFormAction
            ? undefined
            : async (event) => {
                event.preventDefault();
                await handleCreate();
              }
        }
        className="
          flex items-center gap-1 rounded-full border border-dashed border-gray-300
          bg-gray-50 px-2 py-1 shadow-sm
          dark:border-gray-700 dark:bg-gray-950
        "
      >
        <span className="text-sm text-gray-400">#</span>

        <input
          name="name"
          value={tagName}
          onChange={(event) => {
            setTagName(event.target.value);
            setDuplicateTag(null);
          }}
          placeholder={placeholder}
          className="
            w-24 bg-transparent text-sm text-gray-900 outline-none
            placeholder:text-gray-400
            focus:w-36
            dark:text-gray-100
          "
        />

        <button
          type="submit"
          disabled={!normalized}
          className="
            rounded-full p-1 text-gray-500 transition
            hover:bg-blue-100 hover:text-blue-700
            disabled:cursor-not-allowed disabled:opacity-40
            dark:text-gray-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200
          "
          title="Add tag"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {duplicateTag && (
        <div
          className="
      mt-2 flex items-center gap-2 rounded-xl
      border border-amber-300 bg-amber-50
      px-3 py-2 text-xs
      dark:border-amber-700 dark:bg-amber-900/20
    "
        >
          <span className="text-amber-800 dark:text-amber-200">
            #{duplicateTag.name} already exists.
          </span>

          {duplicateAlreadyLinked ? (
            <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Already linked
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                onUseExistingTag?.(duplicateTag);
                setTagName("");
                setDuplicateTag(null);
              }}
              className="
          rounded-full border border-amber-400
          px-2 py-1 font-semibold
          text-amber-800 transition
          hover:bg-amber-100
          dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40
        "
            >
              {existingTagActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
