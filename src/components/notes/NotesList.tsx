"use client";

import { useState } from "react";
import { Note } from "@/db/schema";
import { Search } from "lucide-react";

type NotesListProps = {
  notes: Note[];
  openNoteIds: string[];
  onToggleNote: (noteId: string) => void;
};

export default function NotesList({
  notes,
  openNoteIds,
  onToggleNote,
}: NotesListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold dark:text-gray-100 pl-1">Notes</h2>

        <span className="text-xs text-gray-500 dark:text-gray-400 pr-2">
          {filteredNotes.length}/{notes.length}
        </span>
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900">
        <Search className="h-3.5 w-3.5 text-gray-400" />

        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search notes"
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100"
        />
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => {
            const isOpen = openNoteIds.includes(note.id);

            return (
              <button
                key={note.id}
                type="button"
                onClick={() => onToggleNote(note.id)}
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
          })
        ) : (
          <p className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">
            No matching notes.
          </p>
        )}
      </div>
    </section>
  );
}
