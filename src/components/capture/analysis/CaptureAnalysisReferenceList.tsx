import type { CaptureAnalysisData } from "./CaptureAnalysisTypes";

type ReferenceSuggestion = CaptureAnalysisData["possibleReferences"][number];

type CaptureAnalysisReferenceListProps = {
  references: ReferenceSuggestion[];
  onCreateReference: (
    index: number,
    reference: ReferenceSuggestion,
  ) => Promise<void>;
};

export default function CaptureAnalysisReferenceList({
  references,
  onCreateReference,
}: CaptureAnalysisReferenceListProps) {
  if (references.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
        Possible References
      </h4>

      <div className="space-y-3">
        {references.map((reference, index) => (
          <div
            key={`${reference.title}-${index}`}
            className="rounded-lg border border-purple-200 bg-white p-3 dark:border-purple-800 dark:bg-gray-950"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {reference.title || "Suggested Reference"}
            </p>

            <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-300">
              {reference.type && <p>Type: {reference.type}</p>}
              {reference.author && <p>Author: {reference.author}</p>}

              {reference.url && (
                <p>
                  URL:{" "}
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    {reference.url}
                  </a>
                </p>
              )}

              {reference.notes && (
                <div className="mt-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
                  <p className="font-semibold">Why this matters</p>
                  <p className="mt-1">{reference.notes}</p>
                </div>
              )}

              {reference.duplicateWarning && (
                <div className="mt-2 rounded-md border border-yellow-100 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
                  <p className="font-semibold">Duplicate Reference</p>
                  <p className="mt-1">
                    A reference with the same title already exists:{" "}
                    <a
                      href={`/references/${reference.referenceId}`}
                      className="underline hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      {reference.existingReferenceTitle}
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3">
              {reference.created ? (
                <span className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                  Reference Created
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onCreateReference(index, reference)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Create Reference
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
