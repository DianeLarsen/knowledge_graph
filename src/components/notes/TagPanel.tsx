"use client";

import { useState } from "react";
import { createTagAction } from "@/app/actions/tags";
import { Tag } from "@/db/schema";
import { Plus } from "lucide-react";
import TagPill from "@/components/notes/TagPill";
import type { NoteDetails } from "@/components/notes/card/noteCardTypes";

type TagStats = {
  tagId: string;
  tagName: string;
  noteCount: number;
} | null;

type TagPanelProps = {
  tags: Tag[];
  dataList: NoteDetails[];
  openNoteIds: string[];
  tagStats?: {
    tag: Tag;
    stats: TagStats;
  }[];
  onOpenCardsByTag: (tagId: string) => void;
};

function normalizeTagName(value: string) {
  return value.trim().replace(/^#+/, "").trim();
}



export default function TagPanel({
  tags,
  tagStats = [],
  onOpenCardsByTag,
  dataList = [],
  openNoteIds = [],
}: TagPanelProps) {
  const [tagName, setTagName] = useState("");
  const normalizedTagName = normalizeTagName(tagName);

  function getStatsForTag(tagId: string) {
    return tagStats.find((item) => item.tag.id === tagId)?.stats ?? null;
  }

  function areAllCardsForTagOpen(tagId: string) {
    const noteIdsForTag = dataList
      .filter((data) => data.tags.some((tag) => tag.id === tagId))
      .map((data) => data.note.id);

    if (noteIdsForTag.length === 0) return false;

    return noteIdsForTag.every((noteId) => openNoteIds.includes(noteId));
  }

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Tags
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <TagPill
            key={tag.id}
            tag={tag}
            stats={getStatsForTag(tag.id)}
            onOpenCardsByTag={onOpenCardsByTag}
            active={areAllCardsForTagOpen(tag.id)}
          />
        ))}

        <form
          action={async (formData) => {
            await createTagAction(formData);
            setTagName("");
          }}
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
            onChange={(event) => setTagName(event.target.value)}
            placeholder="add tag"
            className="
              w-24 bg-transparent text-sm text-gray-900 outline-none
              placeholder:text-gray-400
              focus:w-36
              dark:text-gray-100
            "
          />

          <button
            type="submit"
            disabled={!normalizedTagName}
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

        {tags.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tags yet.
          </p>
        )}
      </div>
    </section>
  );
}
