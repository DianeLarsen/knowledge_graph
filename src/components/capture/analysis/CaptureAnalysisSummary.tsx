import { ChevronDown, ChevronRight } from "lucide-react";
import type { CaptureAnalysisData } from "./CaptureAnalysisTypes";

type CaptureAnalysisSummaryProps = {
  analysis: CaptureAnalysisData;
  isOpen: boolean;
  onToggle: () => void;
  onOpenProjectBuilder: () => void;
};

export default function CaptureAnalysisSummary({
  analysis,
  isOpen,
  onToggle,
  onOpenProjectBuilder,
}: CaptureAnalysisSummaryProps) {
  return (
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
              onClick={onOpenProjectBuilder}
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
        onClick={onToggle}
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
  );
}
