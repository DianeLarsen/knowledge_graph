"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { createTaskFromCaptureAction } from "@/app/actions/capture";

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
  }[];
  possibleReferences: {
    type?: string;
    title?: string;
    url?: string;
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

                    <form action={createTaskFromCaptureAction} className="mt-3">
                      <input type="hidden" name="captureId" value={captureId} />
                      <input type="hidden" name="taskIndex" value={index} />
                      <input type="hidden" name="title" value={task.title} />
                      <input
                        type="hidden"
                        name="description"
                        value={task.description}
                      />
                      <input
                        type="hidden"
                        name="priority"
                        value={task.priority}
                      />
                      {task.duplicateWarning && (
                        <div className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                          Similar task found:{" "}
                          <span className="font-semibold">
                            {task.similarTaskTitle}
                          </span>
                        </div>
                      )}
                      {task.created ? (
                        <span className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                          Task Created
                        </span>
                      ) : task.duplicateWarning ? (
                        <span className="inline-flex rounded-md bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                          Possible Duplicate
                        </span>
                      ) : (
                        <button
                          type="submit"
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Create Task
                        </button>
                      )}
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
          <AnalysisSection
            title="Possible Notes"
            items={analysis.possibleNotes.map((note) => note.title)}
          />
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
