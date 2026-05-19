"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  createTaskFromCaptureAction,
  createNoteFromCaptureAction,
  createReferenceFromCaptureAction,
} from "@/app/actions/capture";
import { createProjectFromCaptureAction } from "@/app/actions/capture";

type CaptureAnalysisData = {
  summary: string;
  projectCreated?: boolean;
  projectId?: string;
  projectTitle?: string;
  possibleTasks: {
    title: string;
    description: string;
    priority: string;
    status: string;
    created?: boolean;
    taskId?: string;
    duplicateWarning?: boolean;
    similarTaskId?: string;
    similarTaskTitle?: string;
  }[];
  possibleNotes: {
    title: string;
    content: string;
    created?: boolean;
    noteId?: string;
  }[];
  possibleReferences: {
    type?: string;
    title?: string;
    author?: string;
    url?: string;
    notes?: string;
    created?: boolean;
    referenceId?: string;
    duplicateWarning?: boolean;
    existingReferenceTitle?: string;
  }[];
  aiPrompts: string[];
  nextSteps: string[];
  openQuestions: string[];
  risks: string[];
};

export default function CaptureAnalysis({
  analysisJson,
  captureId,
}: {
  analysisJson: string;
  captureId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const analysis = JSON.parse(analysisJson) as CaptureAnalysisData;
  const router = useRouter();
  const [showProjectBuilder, setShowProjectBuilder] = useState(false);
  const [projectTitle, setProjectTitle] = useState(
    analysis.projectTitle || analysis.summary || "",
  );
  const [includeCapture, setIncludeCapture] = useState(true);

  const [selectedTaskIndexes, setSelectedTaskIndexes] = useState<number[]>(
    analysis.possibleTasks.map((_, index) => index),
  );

  const [selectedNoteIndexes, setSelectedNoteIndexes] = useState<number[]>(
    analysis.possibleNotes.map((_, index) => index),
  );

  const [selectedReferenceIndexes, setSelectedReferenceIndexes] = useState<
    number[]
  >(analysis.possibleReferences.map((_, index) => index));



  function toggleIndex(
    index: number,
    values: number[],
    setter: (next: number[]) => void,
  ) {
    setter(
      values.includes(index)
        ? values.filter((value) => value !== index)
        : [...values, index],
    );
  }

  async function handleCreateProjectFromCapture() {
    const formData = new FormData();

    formData.set("captureId", captureId);
    formData.set("projectTitle", projectTitle);
    formData.set("includeCapture", String(includeCapture));
    formData.set("selectedTaskIndexes", selectedTaskIndexes.join(","));
    formData.set("selectedNoteIndexes", selectedNoteIndexes.join(","));
    formData.set(
      "selectedReferenceIndexes",
      selectedReferenceIndexes.join(","),
    );

    await createProjectFromCaptureAction(formData);

    setShowProjectBuilder(false);
    router.refresh();
  }

  async function handleCreateTaskFromCapture(
    index: number,
    task: CaptureAnalysisData["possibleTasks"][number],
  ) {
    const formData = new FormData();

    formData.set("captureId", captureId);
    formData.set("taskIndex", String(index));
    formData.set("title", task.title);
    formData.set("description", task.description);
    formData.set("priority", task.priority);

    await createTaskFromCaptureAction(formData);
    router.refresh();
  }

  async function handleCreateNoteFromCapture(
    index: number,
    note: CaptureAnalysisData["possibleNotes"][number],
  ) {
    const formData = new FormData();

    formData.set("captureId", captureId);
    formData.set("noteIndex", String(index));
    formData.set("title", note.title);
    formData.set("content", note.content);

    await createNoteFromCaptureAction(formData);
    router.refresh();
  }

  async function handleCreateReferenceFromCapture(
    index: number,
    reference: CaptureAnalysisData["possibleReferences"][number],
  ) {
    const formData = new FormData();

    formData.set("captureId", captureId);
    formData.set("referenceIndex", String(index));
    formData.set("type", reference.type ?? "other");
    formData.set("title", reference.title ?? "");
    formData.set("author", reference.author ?? "");
    formData.set("url", reference.url ?? "");
    formData.set("notes", reference.notes ?? "");

    await createReferenceFromCaptureAction(formData);
    router.refresh();
  }

  return (
    <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Analysis
            </h3>

            {analysis.projectCreated && analysis.projectId ? (
              <a
                href={`/projects/${analysis.projectId}`}
                className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
              >
                Project Created - View Project
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowProjectBuilder(true)}
                className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
              >
                Create project from this capture
              </button>
            )}
          </div>

          {!isOpen && (
            <p className="mt-2 line-clamp-2 text-xs text-purple-700 dark:text-purple-300">
              {analysis.summary}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40"
          aria-label={isOpen ? "Collapse analysis" : "Expand analysis"}
        >
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-purple-700 dark:text-purple-300" />
          ) : (
            <ChevronRight className="h-5 w-5 text-purple-700 dark:text-purple-300" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4">
          <p className="mb-4 text-sm text-purple-900 dark:text-purple-100">
            {analysis.summary}
          </p>

          {analysis.possibleTasks.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                Possible Tasks
              </h4>

              <div className="space-y-3">
                {analysis.possibleTasks.map((task, index) => (
                  <div
                    key={`${task.title}-${index}`}
                    className="rounded-lg border border-purple-200 bg-white p-3 dark:border-purple-800 dark:bg-gray-950"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {task.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {task.description}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Priority: {task.priority}
                    </p>

                    <div className="mt-3">
                      {task.duplicateWarning && (
                        <div className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                          Similar task found:{" "}
                          <span className="font-semibold">
                            {task.similarTaskTitle}
                          </span>
                        </div>
                      )}
                      {task.created && task.taskId ? (
                        <a
                          href={`/tasks#task-${task.taskId}`}
                          className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                        >
                          Task Created - View Task
                        </a>
                      ) : task.created ? (
                        <span className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                          Task Created
                        </span>
                      ) : task.duplicateWarning ? (
                        <span className="inline-flex rounded-md bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                          Possible Duplicate
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await handleCreateTaskFromCapture(index, task);
                          }}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Create Task
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {analysis.possibleNotes.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                Possible Notes
              </h4>

              <div className="space-y-3">
                {analysis.possibleNotes.map((note, index) => (
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
                          onClick={async () => {
                            await handleCreateNoteFromCapture(index, note);
                          }}
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
          )}
          {analysis.possibleReferences.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                Possible References
              </h4>

              <div className="space-y-3">
                {analysis.possibleReferences.map((reference, index) => (
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
                      {reference.created && reference.referenceId ? (
                        <span className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                          Reference Created
                        </span>
                      ) : reference.created ? (
                        <span className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                          Reference Created
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await handleCreateReferenceFromCapture(
                              index,
                              reference,
                            );
                          }}
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
          )}
          <AnalysisSection title="AI Prompts" items={analysis.aiPrompts} />
          <AnalysisSection title="Next Steps" items={analysis.nextSteps} />
          <AnalysisSection
            title="Open Questions"
            items={analysis.openQuestions}
          />
          <AnalysisSection title="Risks" items={analysis.risks} />
        </div>
      )}

      {showProjectBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Create project from capture
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Choose which analyzed items should become part of the project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProjectBuilder(false)}
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
                          toggleIndex(
                            index,
                            selectedTaskIndexes,
                            setSelectedTaskIndexes,
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
                          toggleIndex(
                            index,
                            selectedNoteIndexes,
                            setSelectedNoteIndexes,
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
                          toggleIndex(
                            index,
                            selectedReferenceIndexes,
                            setSelectedReferenceIndexes,
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

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowProjectBuilder(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateProjectFromCapture}
                  disabled={!projectTitle.trim()}
                  className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Create project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisSection({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
        {title}
      </h4>

      <ul className="list-disc space-y-1 pl-5 text-sm text-purple-900 dark:text-purple-100">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ProjectBuilderSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h4>

      <div className="space-y-2">{children}</div>
    </section>
  );
}