"use client";

import { useState } from "react";
import Link from "next/link";

type NoteSummary = {
  id: string;
  title: string;
  content: string | null;
};

type WorkspaceProps = {
  notes: NoteSummary[];
};

export default function NotesWorkspace({ notes }: WorkspaceProps) {
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const openNotes = notes.filter((note) => openNoteIds.includes(note.id));

  function toggleNote(noteId: string) {
    setOpenNoteIds((current) =>
      current.includes(noteId)
        ? current.filter((id) => id !== noteId)
        : [...current, noteId],
    );
  }

  return (
    <main className="grid min-h-screen gap-4 bg-gray-50 p-4 dark:bg-gray-950 lg:grid-cols-[260px_1fr_320px]">
      <aside className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold dark:text-gray-100">Notes</h2>

        <div className="space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => toggleNote(note.id)}
              className="w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              {note.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="overflow-x-auto rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold dark:text-gray-100">
          Open Cards
        </h2>

        <div className="flex gap-6 overflow-x-auto pb-6">
          {openNotes.length > 0 ? (
            openNotes.map((note) => (
              <div key={note.id} className="min-w-[420px] max-w-[420px]">
                <MiniIndexCard note={note} />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select notes to open cards.
            </p>
          )}
        </div>
      </section>

      <aside className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold dark:text-gray-100">
          Quick Note
        </h2>

        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Title"
          className="mb-3 w-full rounded-xl border px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Write while looking at other cards..."
          rows={10}
          className="w-full resize-none rounded-xl border px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <button className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
          Save Note
        </button>
      </aside>
    </main>
  );
}

function MiniIndexCard({ note }: { note: NoteSummary }) {
  return (
    <article className="border bg-white shadow-[6px_6px_0_rgba(0,0,0,0.06)] dark:border-gray-800 dark:bg-gray-950">
      <div className="h-6" />

      <div className="flex h-10 items-end border-b border-red-400 px-4 pl-10">
        <h3 className="translate-y-1 font-['Comic_Sans_MS','Bradley_Hand',cursive] text-2xl font-semibold dark:text-gray-100">
          {note.title}
        </h3>
      </div>

      <div className="flex min-h-10 items-end border-b border-blue-300 px-4 pl-10">
        <p className="translate-y-1 font-['Comic_Sans_MS','Bradley_Hand',cursive] text-xl dark:text-gray-100">
          {note.content || "No content yet."}
        </p>
      </div>

      <div className="h-10 border-b border-blue-300" />
      <div className="h-10 border-b border-blue-300" />
      <div className="h-10 border-b border-blue-300" />
    </article>
  );
}
