"use client";

import { useState } from "react";
import NewNoteComposer from "@/components/NewNoteComposer";
import NoteCard, { NoteDetails } from "@/components/NoteCard";
import { Reference } from "@/db/schema";

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

const tags = Array.from(
  new Map(
    dataList.flatMap((data) => data.tags).map((tag) => [tag.id, tag]),
  ).values(),
);


const openNotes = dataList.filter((data) => openNoteIds.includes(data.note.id));

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

 
  return (
    <main className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950">
      <section className="mb-4 rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tags
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => openCardsByTag(tag.id)}
                className="
                rounded-full border border-gray-300 bg-white px-3 py-1
                text-sm text-gray-700 shadow-sm transition
                hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700
                dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200
                dark:hover:border-blue-400 dark:hover:bg-blue-900/40
                dark:hover:text-blue-200
              "
              >
                #{tag.name}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tags yet.
            </p>
          )}
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
        <aside className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-lg font-semibold dark:text-gray-100">
            Notes
          </h2>

          <div className="space-y-2">
            {notes.map((note) => {
              const isOpen = openNoteIds.includes(note.id);

              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => toggleNote(note.id)}
                  className={`
        w-full rounded-xl border px-3 py-2 text-left text-sm transition
        ${
          isOpen
            ? "border-blue-500 bg-blue-100 text-blue-800 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-200"
            : "border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
        }
      `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{note.title}</span>

                    {isOpen && (
                      <span className="shrink-0 rounded-full bg-blue-200 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        open
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
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
                allTags={tags}
                allReferences={references}
                userId={userId}
                onOpenNote={openNote}
                onClose={() => closeNote(data.note.id)}
              />
            ))}
          </div>
        </section>

        <NewNoteComposer
          notes={notes}
          tags={tags}
          references={references}
          userId={userId}
        />
      </div>
    </main>
  );
}

