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
};

export default function EditNoteReferencesSection({
  references,
  selectedReferenceIds,
  showReferenceComposer,
  onToggleReference,
  onToggleReferenceComposer,
  onReferenceCreated,
}: EditNoteReferencesSectionProps) {
  return (
    <section className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        References
      </h3>

      <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
        {references.length > 0 ? (
          references.map((reference) => {
            const selected = selectedReferenceIds.includes(reference.id);

            return (
              <button
                key={reference.id}
                type="button"
                onClick={() => onToggleReference(reference.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selected
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="block font-medium">{reference.title}</span>
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
