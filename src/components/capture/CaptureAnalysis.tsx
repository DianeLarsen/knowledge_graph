"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type CaptureAnalysisData = {
  summary: string;
  possibleTasks: {
    title: string;
    description: string;
    priority: string;
    status: string;
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
}: {
  analysisJson: string;
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

          <AnalysisSection
            title="Possible Tasks"
            items={analysis.possibleTasks.map(
              (task) =>
                `${task.title} (${task.priority}) - ${task.description}`,
            )}
          />
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
