"use client";

import { useState } from "react";
import NewNoteComposer from "@/components/notes/NewNoteComposer";
import NoteCard, { NoteDetails } from "@/components/notes/NoteCard";
import { Reference } from "@/db/schema";
import TagPanel from "@/components/notes/TagPanel";
import NotesList from "@/components/notes/NotesList";

type WorkspaceProps = {
  dataList: NoteDetails[];
  references: Reference[];
  userId: string;
};

export default function NotesWorkspace({
  dataList,
  userId,
  references,
}: WorkspaceProps) {

  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

  const notes = dataList.map((data) => data.note);
  const noteOptions = notes.map((note) => ({
    id: note.id,
    title: note.title,
  }));

  const tags = Array.from(
    new Map(
      dataList.flatMap((data) => data.tags).map((tag) => [tag.id, tag]),
    ).values(),
  );

const tagStats = tags.map((tag) => ({
  tag,
  stats: {
    tagId: tag.id,
    tagName: tag.name,
    noteCount: dataList.filter((data) =>
      data.tags.some((item) => item.id === tag.id),
    ).length,
  },
}));

  const openNotes = dataList.filter((data) =>
    openNoteIds.includes(data.note.id),
  );

  function toggleNote(noteId: string) {
    setOpenNoteIds((current) =>
      current.includes(noteId)
        ? current.filter((id) => id !== noteId)
        : [...current, noteId],
    );
  }

  function closeNote(noteId: string) {
    setOpenNoteIds((current) => current.filter((id) => id !== noteId));
  }
  function openCardsByTag(tagId: string) {
    const matchingNoteIds = dataList
      .filter((data) => data.tags.some((tag) => tag.id === tagId))
      .map((data) => data.note.id);

    setOpenNoteIds((current) => [...new Set([...current, ...matchingNoteIds])]);
  }

  function closeAllCards() {
    setOpenNoteIds([]);
  }

  function openNote(noteId: string) {
    setOpenNoteIds((current) =>
      current.includes(noteId) ? current : [...current, noteId],
    );
  }

 

  function getPlainTextLength(data: NoteDetails) {
    return data.note.content?.length ?? 0;
  }
  const compactShouldScroll = openNotes.length > 3;
  const compactTagLimit =
    openNotes.length <= 1 ? 8 : openNotes.length === 2 ? 3 : 2;
  
  return (
    <main className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
        <aside className="space-y-5 rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <TagPanel
            tags={tags}
            tagStats={tagStats}
            onOpenCardsByTag={openCardsByTag}
          />

          <div className="border-t border-gray-200 pt-5 dark:border-gray-800">
            <NotesList
              notes={notes}
              openNoteIds={openNoteIds}
              onToggleNote={toggleNote}
            />
          </div>
        </aside>

        <section className="overflow-x-auto rounded-2xl border bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-gray-100">
              Open Cards
            </h2>

            <button
              type="button"
              onClick={closeAllCards}
              disabled={openNoteIds.length === 0}
              className="
      rounded-xl border px-3 py-1 text-sm
      text-gray-700 hover:bg-gray-100
      disabled:cursor-not-allowed disabled:opacity-50
      dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800
    "
            >
              Close all
            </button>
          </div>
          <div
            className="
    grid gap-4
    [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]
  "
          >
            {openNotes.map((data) => (
              <NoteCard
                key={data.note.id}
                data={data}
                compact
                compactTagLimit={compactTagLimit}
                compactShouldScroll={
                  compactShouldScroll && getPlainTextLength(data) > 180
                }
                allNotes={noteOptions}
                userTags={tags}
                userReferences={references}
                userId={userId}
                onOpenNote={openNote}
                onClose={() => closeNote(data.note.id)}
                
              />
            ))}
          </div>
        </section>

        <NewNoteComposer notes={notes} tags={tags} references={references} />
      </div>
    </main>
  );
}
