"use client";

import { createTagAction } from "@/app/actions/tags";
import { Tag } from "@/db/schema";
import TagPill from "@/components/tags/TagPill";
import type { NoteDetails } from "@/components/notes/card/noteCardTypes";
import TagCreateInput from "@/components/tags/TagCreateInput";

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

export default function WorkspaceTagPanel({
  tags,
  tagStats = [],
  onOpenCardsByTag,
  dataList = [],
  openNoteIds = [],
}: TagPanelProps) {



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

        <TagCreateInput
          tags={tags}
          useFormAction
          existingTagActionLabel="Open matching cards"
          onCreateTag={async (_tagName, formData) => {
            if (!formData) return;
            await createTagAction(formData);
          }}
          onUseExistingTag={(tag) => {
            onOpenCardsByTag(tag.id);
          }}
        />

        {tags.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tags yet.
          </p>
        )}
      </div>
    </section>
  );
}
