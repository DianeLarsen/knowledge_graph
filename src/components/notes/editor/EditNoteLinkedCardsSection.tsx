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
const sortedLinkableNotes = [...linkableNotes].sort((a, b) => {
  const aSelected = selectedLinkedNoteIds.includes(a.id);
  const bSelected = selectedLinkedNoteIds.includes(b.id);

  if (aSelected !== bSelected) return aSelected ? -1 : 1;

  return a.title.localeCompare(b.title);
});
  return (
    <section className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Linked Cards
      </h3>

      <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
        {sortedLinkableNotes.length > 0 ? (
          sortedLinkableNotes.map((linkedNote) => {
            const selected = selectedLinkedNoteIds.includes(linkedNote.id);

            return (
              <button
                key={linkedNote.id}
                type="button"
                onClick={() => onToggleLinkedNote(linkedNote.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100"
                    : "text-[rgb(var(--text))] hover:bg-[rgb(var(--card-muted))]"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{linkedNote.title}</span>

                  {selected && (
                    <span className="rounded-full bg-[rgb(var(--card))] px-2 py-0.5 text-xs font-semibold text-[rgb(var(--muted-text))]">
                      Linked
                    </span>
                  )}
                </span>
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
