"use client";

import { useState } from "react";
import NewNoteComposer from "@/components/NewNoteComposer";
import { Note, Reference, Tag } from "@/db/schema";
import ReadOnlyNoteContent from "@/components/ReadOnlyNoteContent";
import EditNoteForm from "@/components/EditNoteForm";

type NoteTagSummary = {
  noteId: string;
  tagId: string;
};
type WorkspaceNoteReferenceSummary = {
  id: string;
  type: Reference["type"];
  title: string;
  author: string | null;
  url: string | null;
  publisher: string | null;
  publishedDate: string | null;
  citation: string | null;
  notes: string | null;

  noteReferenceId: string;
  noteId: string;
  referenceId: string;
  pageNumber: string | null;
  location: string | null;
  quote: string | null;
  summary: string | null;
};
type WorkspaceProps = {
  notes: Note[];
  tags: Tag[];
  noteTags: NoteTagSummary[];
  references: Reference[];
  noteReferences: WorkspaceNoteReferenceSummary[];
  userId: string;
};

export default function NotesWorkspace({
  notes,
  tags,
  noteTags,
  references,
  noteReferences,
  userId,
}: WorkspaceProps) {
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

const openNotes = notes
  .filter((note) => openNoteIds.includes(note.id))
  .map((note) => {
    const tagsForThisNote = tags.filter((tag) =>
      noteTags.some((nt) => nt.noteId === note.id && nt.tagId === tag.id),
    );

  const referencesForThisNote = noteReferences.filter(
    (reference) => reference.noteId === note.id,
  );

    return {
      note,
      tagsForThisNote,
      referencesForThisNote,
    };
  });

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
    const noteIdsForTag = noteTags
      .filter((noteTag) => noteTag.tagId === tagId)
      .map((noteTag) => noteTag.noteId);

    setOpenNoteIds((current) => {
      const combined = [...current, ...noteIdsForTag];
      return [...new Set(combined)];
    });
  }

  function closeAllCards() {
    setOpenNoteIds([]);
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
            {openNotes.length > 0 ? (
              openNotes.map(
                ({ note, tagsForThisNote, referencesForThisNote }) => (
                  <div key={note.id} className="relative w-full">
                    <MiniIndexCard
                      note={note}
                      tags={tagsForThisNote}
                      allTags={tags}
                      references={references}
                      noteReferences={referencesForThisNote}
                      userId={userId}
                      onClose={() => closeNote(note.id)}
                    />
                  </div>
                ),
              )
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select notes to open cards.
              </p>
            )}
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

function MiniIndexCard({
  note,
  tags,
  allTags,
  references,
  noteReferences,
  userId,
  onClose,
}: {
  note: Note;
  tags: Tag[];
  allTags: Tag[];
  references: Reference[];
  noteReferences: WorkspaceNoteReferenceSummary[];
  userId: string;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <article className="relative border bg-white shadow-[6px_6px_0_rgba(0,0,0,0.06)] dark:border-gray-800 dark:bg-gray-950">
      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${note.title}`}
        className="
          absolute right-2 top-2 z-10
          flex h-6 w-6 items-center justify-center
          rounded-full border border-gray-300 bg-white
          text-sm font-bold leading-none text-gray-600
          shadow-sm transition
          hover:border-red-400 hover:bg-red-500 hover:text-white
          dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
          dark:hover:border-red-400 dark:hover:bg-red-500 dark:hover:text-white
        "
      >
        ×
      </button>
      <button
        type="button"
        onClick={() => setIsEditing((current) => !current)}
        className="
    absolute right-10 top-2 z-10
    rounded-full border border-gray-300 bg-white px-2 py-0.5
    text-xs text-gray-600 shadow-sm transition
    hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700
    dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
    dark:hover:border-blue-400 dark:hover:bg-blue-900/40
  "
      >
        {isEditing ? "View" : "Edit"}
      </button>
      <div className="h-5" />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-1">
          {tags.map((tag) => (
            <span
              key={tag.id}
              title={`Tag: ${tag.name}`}
              className="
                rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5
                text-xs text-gray-700
                hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700
                dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200
                dark:hover:border-blue-400 dark:hover:bg-blue-900/40
              "
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex h-8 items-end border-b border-red-400 px-3 pr-10">
        <h3 className="translate-y-0.5 truncate font-['Comic_Sans_MS','Bradley_Hand',cursive] text-lg font-semibold dark:text-gray-100">
          {note.title}
        </h3>
      </div>

      <div
        className="
    min-h-40 px-4 py-0
bg-[linear-gradient(to_bottom,transparent_31px,#93c5fd_32px)]
bg-[length:100%_32px]
dark:bg-[linear-gradient(to_bottom,transparent_31px,#60a5fa_32px)]
  "
      >
        {isEditing ? (
          <EditNoteForm
            note={note}
            tags={allTags}
            noteTags={tags}
            references={references}
            noteReferences={noteReferences}
            userId={userId}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ReadOnlyNoteContent content={note.contentJson} />
        )}
      </div>

      <div className="h-10 border-b border-blue-300" />
    </article>
  );
}
