"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  createTaskFromCaptureAction,
  createNoteFromCaptureAction,
  createReferenceFromCaptureAction,
} from "@/app/actions/capture";

type CaptureAnalysisData = {
  summary: string;
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
  const [isOpen, setIsOpen] = useState(true);
  const analysis = JSON.parse(analysisJson) as CaptureAnalysisData;
  const router = useRouter();

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
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
            Analysis
          </h3>
          {!isOpen && (
            <p className="mt-1 text-xs text-purple-700 dark:text-purple-300">
              {analysis.summary}
            </p>
          )}
        </div>

        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-purple-700 dark:text-purple-300" />
        ) : (
          <ChevronRight className="h-4 w-4 text-purple-700 dark:text-purple-300" />
        )}
      </button>

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
