import ProjectBuilderSection from "./ProjectBuilderSection";
import type { CaptureAnalysisData } from "./CaptureAnalysisTypes";

type ExistingProjectNoteSuggestion = {
  id: string;
  title: string;
  content?: string | null;
  reason?: string;
};

type CaptureProjectBuilderModalProps = {
  analysis: CaptureAnalysisData;
  projectTitle: string;
  setProjectTitle: (value: string) => void;
  includeCapture: boolean;
  setIncludeCapture: (value: boolean) => void;

  existingNoteSuggestions?: ExistingProjectNoteSuggestion[];
  selectedExistingNoteIds: string[];
  setSelectedExistingNoteIds: (values: string[]) => void;

  selectedTaskIndexes: number[];
  setSelectedTaskIndexes: (values: number[]) => void;
  selectedNoteIndexes: number[];
  setSelectedNoteIndexes: (values: number[]) => void;
  selectedReferenceIndexes: number[];
  setSelectedReferenceIndexes: (values: number[]) => void;
  onClose: () => void;
  onCreateProject: () => void;

  isSuggestingExistingNotes: boolean;
  onSuggestExistingNotes: () => void;
};

function toggleIndex(index: number, values: number[]) {
  return values.includes(index)
    ? values.filter((value) => value !== index)
    : [...values, index];
}

export default function CaptureProjectBuilderModal({
  analysis,
  projectTitle,
  setProjectTitle,
  includeCapture,
  setIncludeCapture,
  selectedTaskIndexes,
  setSelectedTaskIndexes,
  selectedNoteIndexes,
  setSelectedNoteIndexes,
  selectedReferenceIndexes,
  setSelectedReferenceIndexes,
  onClose,
  onCreateProject,
  existingNoteSuggestions = [],
  selectedExistingNoteIds,
  setSelectedExistingNoteIds,
  isSuggestingExistingNotes,
  onSuggestExistingNotes,
}: CaptureProjectBuilderModalProps) {
  
  function toggleStringValue(value: string, values: string[]) {
    return values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Create project from capture
            </h3>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                    Existing notes
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    Optionally ask AI to find notes that may belong in this
                    project.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onSuggestExistingNotes}
                  disabled={isSuggestingExistingNotes}
                  className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-gray-950 dark:text-amber-200 dark:hover:bg-amber-900/40"
                >
                  {isSuggestingExistingNotes ? "Checking..." : "Suggest notes"}
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose which analyzed items should become part of the project.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={projectTitle}
            onChange={(event) => setProjectTitle(event.target.value)}
            placeholder="Project title"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={includeCapture}
              onChange={(event) => setIncludeCapture(event.target.checked)}
            />
            Include original capture as project source
          </label>

          {analysis.possibleTasks.length > 0 && (
            <ProjectBuilderSection title="Tasks">
              {analysis.possibleTasks.map((task, index) => (
                <label
                  key={`${task.title}-${index}`}
                  className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                >
                  <input
                    type="checkbox"
                    checked={selectedTaskIndexes.includes(index)}
                    onChange={() =>
                      setSelectedTaskIndexes(
                        toggleIndex(index, selectedTaskIndexes),
                      )
                    }
                  />

                  <span>
                    <span className="block font-semibold text-gray-900 dark:text-gray-100">
                      {task.title}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {task.description}
                    </span>
                  </span>
                </label>
              ))}
            </ProjectBuilderSection>
          )}

          {analysis.possibleNotes.length > 0 && (
            <ProjectBuilderSection title="Notes">
              {analysis.possibleNotes.map((note, index) => (
                <label
                  key={`${note.title}-${index}`}
                  className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                >
                  <input
                    type="checkbox"
                    checked={selectedNoteIndexes.includes(index)}
                    onChange={() =>
                      setSelectedNoteIndexes(
                        toggleIndex(index, selectedNoteIndexes),
                      )
                    }
                  />

                  <span>
                    <span className="block font-semibold text-gray-900 dark:text-gray-100">
                      {note.title}
                    </span>
                    <span className="line-clamp-2 block text-xs text-gray-500 dark:text-gray-400">
                      {note.content}
                    </span>
                  </span>
                </label>
              ))}
            </ProjectBuilderSection>
          )}

          {analysis.possibleReferences.length > 0 && (
            <ProjectBuilderSection title="References">
              {analysis.possibleReferences.map((reference, index) => (
                <label
                  key={`${reference.title}-${index}`}
                  className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                >
                  <input
                    type="checkbox"
                    checked={selectedReferenceIndexes.includes(index)}
                    onChange={() =>
                      setSelectedReferenceIndexes(
                        toggleIndex(index, selectedReferenceIndexes),
                      )
                    }
                  />

                  <span>
                    <span className="block font-semibold text-gray-900 dark:text-gray-100">
                      {reference.title || "Untitled reference"}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {reference.type ?? "other"}
                      {reference.author ? ` · ${reference.author}` : ""}
                    </span>
                  </span>
                </label>
              ))}
            </ProjectBuilderSection>
          )}
          {existingNoteSuggestions.length > 0 && (
            <ProjectBuilderSection title="Suggested existing notes">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optional notes that may belong in this project.
              </p>

              {existingNoteSuggestions.map((note) => (
                <label
                  key={note.id}
                  className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/30"
                >
                  <input
                    type="checkbox"
                    checked={selectedExistingNoteIds.includes(note.id)}
                    onChange={() =>
                      setSelectedExistingNoteIds(
                        toggleStringValue(note.id, selectedExistingNoteIds),
                      )
                    }
                  />

                  <span>
                    <span className="block font-semibold text-gray-900 dark:text-gray-100">
                      {note.title}
                    </span>

                    {note.reason && (
                      <span className="block text-xs text-amber-800 dark:text-amber-200">
                        {note.reason}
                      </span>
                    )}

                    {note.content && (
                      <span className="line-clamp-2 block text-xs text-gray-500 dark:text-gray-400">
                        {note.content}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </ProjectBuilderSection>
          )}
          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onCreateProject}
              disabled={!projectTitle.trim()}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
