"use client";

import { useState } from "react";
import CaptureAnalysis from "@/components/capture/CaptureAnalysis";
import {
  analyzeCaptureAction,
  markCaptureProcessedAction,
  archiveCaptureAction,
} from "@/app/actions/capture";

type CaptureStatus = "all" | "new" | "analyzed" | "processed" | "archived";

type Capture = {
  id: string;
  rawText: string;
  status: string;
  analysisJson: string | null;
  createdAt: Date;
};

export default function CaptureList({ captures }: { captures: Capture[] }) {
  const [filter, setFilter] = useState<CaptureStatus>("all");

  const filteredCaptures =
    filter === "all"
      ? captures
      : captures.filter((capture) => capture.status === filter);

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "new", "analyzed", "processed", "archived"] as const).map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {status}
            </button>
          ),
        )}
      </div>

      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Recent Captures
      </h2>

      {filteredCaptures.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No captures in this filter. A rare moment of order. Suspicious.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredCaptures.map((capture) => (
            <article
              key={capture.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {capture.status}
                </span>

                <time className="text-xs text-gray-400">
                  {new Date(capture.createdAt).toLocaleString()}
                </time>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800 dark:text-gray-200">
                {capture.rawText}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <form action={analyzeCaptureAction.bind(null, capture.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
                  >
                    Analyze
                  </button>
                </form>

                <form
                  action={markCaptureProcessedAction.bind(null, capture.id)}
                >
                  <button
                    type="submit"
                    className="rounded-lg border border-green-300 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950"
                  >
                    Mark Processed
                  </button>
                </form>
               {capture.status !== "archived" && (
  <form action={archiveCaptureAction.bind(null, capture.id)}>
    <button
      type="submit"
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      Archive
    </button>
  </form>
)}
              </div>

              {capture.analysisJson && (
                <CaptureAnalysis
                  analysisJson={capture.analysisJson}
                  captureId={capture.id}
                />
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
