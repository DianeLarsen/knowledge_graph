import type { CaptureAnalysisData } from "./CaptureAnalysisTypes";

type NoteSuggestion = CaptureAnalysisData["possibleNotes"][number];

type CaptureAnalysisNoteListProps = {
  notes: NoteSuggestion[];
  onCreateNote: (index: number, note: NoteSuggestion) => Promise<void>;
};

export default function CaptureAnalysisNoteList({
  notes,
  onCreateNote,
}: CaptureAnalysisNoteListProps) {
  if (notes.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
        Possible Notes
      </h4>

      <div className="space-y-3">
        {notes.map((note, index) => (
          <div
            key={`${note.title}-${index}`}
            className="rounded-lg border border-purple-200 bg-white p-3 dark:border-purple-800 dark:bg-gray-950"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {note.title}
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
              {note.content}
            </p>

            <div className="mt-3">
              {note.created && note.noteId ? (
                <a
                  href={`/notes/${note.noteId}`}
                  className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                >
                  Note Created - View Note
                </a>
              ) : note.created ? (
                <span className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                  Note Created
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onCreateNote(index, note)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Create Note
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
