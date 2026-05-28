"use client";

type LinkedNoteSummary = {
  id: string;
  title: string;
};

type EditNoteLinkedCardsSectionProps = {
  currentNoteId: string;
  availableNotes: LinkedNoteSummary[];
  selectedLinkedNoteIds: string[];
  onToggleLinkedNote: (noteId: string) => void;
};

export default function EditNoteLinkedCardsSection({
  currentNoteId,
  availableNotes,
  selectedLinkedNoteIds,
  onToggleLinkedNote,
}: EditNoteLinkedCardsSectionProps) {
  const linkableNotes = availableNotes.filter(
    (item) => item.id !== currentNoteId,
  );

  return (
    <section className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Linked Cards
      </h3>

      <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
        {linkableNotes.length > 0 ? (
          linkableNotes.map((linkedNote) => {
            const selected = selectedLinkedNoteIds.includes(linkedNote.id);

            return (
              <button
                key={linkedNote.id}
                type="button"
                onClick={() => onToggleLinkedNote(linkedNote.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selected
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {linkedNote.title}
              </button>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No other cards available to link.
          </p>
        )}
      </div>
    </section>
  );
}
