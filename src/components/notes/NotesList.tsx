import { Note } from "@/db/schema";

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
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold dark:text-gray-100">Notes</h2>

      <div className="space-y-2">
        {notes.map((note) => {
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
        })}
      </div>
    </section>
  );
}
