import {
  createCaptureAction,
  getCaptures,
  analyzeCaptureAction,
} from "@/app/actions/capture";
import { Zap } from "lucide-react";

export default async function CapturePage() {
  const captures = await getCaptures();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Zap className="h-7 w-7 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Capture
          </h1>
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Dump messy ideas here. We’ll make sense of them later, because
          apparently your brain insists on filing everything in one drawer.
        </p>
      </div>

      <form action={createCaptureAction} className="mb-10 space-y-4">
        <textarea
          name="rawText"
          rows={10}
          placeholder="Dump your thoughts, project ideas, reminders, references, half-formed plans, suspiciously urgent nonsense..."
          className="w-full rounded-2xl border border-gray-300 bg-white p-4 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
        />

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Save Capture
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Recent Captures
        </h2>

        {captures.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No captures yet. Suspiciously organized. Probably temporary.
          </p>
        ) : (
          <div className="space-y-4">
            {captures.map((capture) => (
              <article
                key={capture.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {capture.status}
                  </span>

                  <time className="text-xs text-gray-400">
                    {capture.createdAt.toLocaleString()}
                  </time>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800 dark:text-gray-200">
                  {capture.rawText}
                </p>
                <form action={analyzeCaptureAction.bind(null, capture.id)}>
                  <button
                    type="submit"
                    className="mt-4 rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
                  >
                    Analyze
                  </button>
                </form>
                {capture.analysisJson && (
                  <CaptureAnalysis analysisJson={capture.analysisJson} />
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

type CaptureAnalysisData = {
  summary: string;
  possibleTasks: {
    title: string;
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

function CaptureAnalysis({ analysisJson }: { analysisJson: string }) {
  const analysis = JSON.parse(analysisJson) as CaptureAnalysisData;

  return (
    <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30">
      <h3 className="mb-2 text-sm font-semibold text-purple-900 dark:text-purple-100">
        Analysis
      </h3>

      <p className="mb-4 text-sm text-purple-900 dark:text-purple-100">
        {analysis.summary}
      </p>

      <AnalysisSection
        title="Possible Tasks"
        items={analysis.possibleTasks.map((task) => task.title)}
      />
      <AnalysisSection
        title="Possible Notes"
        items={analysis.possibleNotes.map((note) => note.title)}
      />
      <AnalysisSection title="AI Prompts" items={analysis.aiPrompts} />
      <AnalysisSection title="Next Steps" items={analysis.nextSteps} />
      <AnalysisSection title="Open Questions" items={analysis.openQuestions} />
      <AnalysisSection title="Risks" items={analysis.risks} />
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