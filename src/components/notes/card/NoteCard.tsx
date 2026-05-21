"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditNoteForm from "@/components/notes/editor/EditNoteForm";
import type { Reference } from "@/db/schema";

import NoteCardHeader from "./NoteCardHeader";
import NoteCardTitle from "./NoteCardTitle";
import NoteCardTags from "./NoteCardTags";
import NoteCardContent from "./NoteCardContent";
import NoteCardDetails from "./NoteCardDetails";
import IndexLine from "./IndexLine";

import type { NoteCardProps } from "./noteCardTypes";
import { getInlineTagInfo } from "./noteCardUtils";
import { TagColor } from "@/lib/types/tags/tagColors";

export default function NoteCard({
  data,
  onClose,
  onOpenNote,
  compact = false,
  allNotes = [],
  userId,
  userTags = [],
  userReferences = [],
  compactShouldScroll = false,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const {
    note,
    tags,
    outgoingLinks,
    backlinks,
    sharedTags,
    tagStats,
    references = [],
  } = data;

  const inlineTags = getInlineTagInfo(note.contentJson);

  const sortedTags = [...tags].sort((a, b) => {
    const aLinked =
      inlineTags.ids.has(a.id) || inlineTags.names.has(a.name.toLowerCase());
    const bLinked =
      inlineTags.ids.has(b.id) || inlineTags.names.has(b.name.toLowerCase());

    if (aLinked && !bLinked) return -1;
    if (!aLinked && bLinked) return 1;

    return a.name.localeCompare(b.name);
  });

  const tagColorMap = new Map<string, TagColor>();

  sortedTags.forEach((tag) => {
    tagColorMap.set(tag.id, tag.color ?? "blue");
  });



  return (
    <div
      className={
        compact
          ? "w-full min-w-0 max-w-full overflow-hidden"
          : "mx-auto w-full max-w-3xl"
      }
    >
      <article
        className={`
          relative isolate w-full min-w-0 max-w-full overflow-hidden border bg-white
          ${
            compact
              ? "border-gray-300 shadow-[4px_4px_0_rgba(0,0,0,0.05)]"
              : "border-gray-200 shadow-[8px_8px_0_rgba(0,0,0,0.06),16px_16px_0_rgba(0,0,0,0.04),24px_24px_0_rgba(0,0,0,0.03)]"
          }
          dark:border-gray-800 dark:bg-gray-950
        `}
      >
        <NoteCardHeader
          userId={userId}
          title={note.title}
          onEdit={() => setIsEditing(true)}
          onClose={onClose}
        />

        <NoteCardTags
          tags={tags}
          tagStats={tagStats}
          inlineTags={inlineTags}
        />

        <NoteCardTitle title={note.title} compact={compact} />

        <NoteCardContent
          note={note}
          tags={tags}
          references={references}
          tagColorMap={tagColorMap}
          compact={compact}
          compactShouldScroll={compactShouldScroll}
        />

        <NoteCardDetails
          noteId={note.id}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          outgoingLinks={outgoingLinks}
          backlinks={backlinks}
          sharedTags={sharedTags}
          references={references}
          userId={userId}
          onOpenNote={onOpenNote}
          router={router}
        />

        {!compact && <IndexLine />}
      </article>

      {isEditing && userId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-950">
            <EditNoteForm
              note={note}
              tags={userTags}
              noteTags={tags}
              references={userReferences as Reference[]}
              noteReferences={data.references ?? []}
              onCancel={() => setIsEditing(false)}
              onSave={() => {
                setIsEditing(false);
                router.refresh();
              }}
              availableNotes={allNotes}
              linkedNoteIds={outgoingLinks.map((link) => link.targetId)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
