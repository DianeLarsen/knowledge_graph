"use client";

import type { Reference } from "@/db/schema";
import ReferenceComposer from "@/components/references/ReferenceComposer";

type EditNoteReferencesSectionProps = {
  references: Reference[];
  selectedReferenceIds: string[];
  showReferenceComposer: boolean;
  onToggleReference: (referenceId: string) => void;
  onToggleReferenceComposer: () => void;
  onReferenceCreated: (reference: Reference) => void;
  inlineReferenceIds: string[];
};

export default function EditNoteReferencesSection({
  references,
  selectedReferenceIds,
  showReferenceComposer,
  onToggleReference,
  onToggleReferenceComposer,
  onReferenceCreated,
  inlineReferenceIds,
}: EditNoteReferencesSectionProps) {

  const sortedReferences = [...references].sort((a, b) => {
    const aSelected = selectedReferenceIds.includes(a.id);
    const bSelected = selectedReferenceIds.includes(b.id);

    if (aSelected !== bSelected) return aSelected ? -1 : 1;

    const aLabel = a.title ?? a.author ?? a.url ?? "";
    const bLabel = b.title ?? b.author ?? b.url ?? "";

    return aLabel.localeCompare(bLabel);
  });

  return (
    <section className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        References
      </h3>

      <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
        {sortedReferences.length > 0 ? (
          sortedReferences.map((reference) => {
            const selected = selectedReferenceIds.includes(reference.id);
            const isInline = inlineReferenceIds.includes(reference.id);
            return (
              <button
                key={reference.id}
                type="button"
                onClick={() => onToggleReference(reference.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                  isInline
                    ? "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
                    : selected
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">{reference.title}</span>

                  <div className="flex items-center gap-1">
                    {isInline && (
                      <span
                        className="
        rounded-full px-2 py-0.5 text-xs font-semibold
        bg-amber-100 text-amber-800
        dark:bg-amber-900/40 dark:text-amber-200
      "
                      >
                        Inline
                      </span>
                    )}

                    {selected && (
                      <span
                        className="
        rounded-full px-2 py-0.5 text-xs font-semibold
        bg-[rgb(var(--card))]
        text-[rgb(var(--muted-text))]
      "
                      >
                        Linked
                      </span>
                    )}
                  </div>
                </span>
                {reference.author && (
                  <span className="block text-xs opacity-75">
                    {reference.author}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No references yet.
          </p>
        )}
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={onToggleReferenceComposer}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {showReferenceComposer
            ? "Hide new reference form"
            : "Add new reference"}
        </button>

        {showReferenceComposer && (
          <div className="mt-3">
            <ReferenceComposer onReferenceCreated={onReferenceCreated} />
          </div>
        )}
      </div>
    </section>
  );
}
