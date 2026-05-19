"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CaptureAnalysis from "@/components/capture/CaptureAnalysis";
import {
  analyzeCaptureAction,
  markCaptureProcessedAction,
  archiveCaptureAction,
  deleteCaptureAction,
} from "@/app/actions/capture";
import type { QuickTag, QuickReference, QuickNote } from "@/lib/tags/tagTypes";
import type { Project } from "@/db/schema";
import PageQuickActions from "../shared/PageQuickActions";
import { getCapturesByUserId } from "@/db/queries/captures";

type CaptureWithQuickActions = Awaited<
  ReturnType<typeof getCapturesByUserId>
>[number];
type CaptureStatus = "all" | "new" | "analyzed" | "processed";

type CaptureProgress = {
  createdTasks: number;
  createdNotes: number;
  createdReferences: number;
  readyToProcess: boolean;
};

type CaptureProps = {
  captures: CaptureWithQuickActions[];
  userId: string;
  tags: QuickTag[];
  references?: QuickReference[];
  notes?: QuickNote[];
  projects: Project[];
};

function getCaptureProgress(analysisJson: string | null): CaptureProgress {
  if (!analysisJson) {
    return {
      createdTasks: 0,
      createdNotes: 0,
      createdReferences: 0,
      readyToProcess: false,
    };
  }

  try {
    const analysis = JSON.parse(analysisJson);

    const createdTasks =
      analysis.possibleTasks?.filter(
        (task: { created?: boolean }) => task.created,
      ).length ?? 0;

    const createdNotes =
      analysis.possibleNotes?.filter(
        (note: { created?: boolean }) => note.created,
      ).length ?? 0;

    const createdReferences =
      analysis.possibleReferences?.filter(
        (reference: { created?: boolean }) => reference.created,
      ).length ?? 0;

    return {
      createdTasks,
      createdNotes,
      createdReferences,
      readyToProcess:
        createdTasks > 0 || createdNotes > 0 || createdReferences > 0,
    };
  } catch {
    return {
      createdTasks: 0,
      createdNotes: 0,
      createdReferences: 0,
      readyToProcess: false,
    };
  }
}

function getCaptureSummary(capture: CaptureWithQuickActions) {
  if (capture.analysisJson) {
    try {
      const analysis = JSON.parse(capture.analysisJson) as {
        summary?: string;
      };

      if (analysis.summary) {
        return analysis.summary;
      }
    } catch {
      // Fall back to raw text below.
    }
  }

  return capture.rawText.length > 160
    ? `${capture.rawText.slice(0, 160)}...`
    : capture.rawText;
}

export default function CaptureList({
  captures,
  userId,
  tags,
  references = [],
  notes = [],
  projects,
}: CaptureProps) {
  const router = useRouter();

  const [filter, setFilter] = useState<CaptureStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [pendingCaptureId, setPendingCaptureId] = useState<string | null>(null);
  const [openCaptureIds, setOpenCaptureIds] = useState<string[]>([]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCaptures = captures.filter((capture) => {
    const matchesArchiveSetting =
      includeArchived || capture.status !== "archived";

    const matchesStatus = filter === "all" || capture.status === filter;

    const matchesSearch =
      !normalizedSearch ||
      capture.rawText.toLowerCase().includes(normalizedSearch) ||
      capture.analysisJson?.toLowerCase().includes(normalizedSearch);

    return matchesArchiveSetting && matchesStatus && matchesSearch;
  });

  async function runCaptureAction(
    captureId: string,
    action: () => Promise<unknown>,
  ) {
    setPendingCaptureId(captureId);

    try {
      await action();
      router.refresh();
    } finally {
      setPendingCaptureId(null);
    }
  }

  function toggleCapture(captureId: string) {
    setOpenCaptureIds((current) =>
      current.includes(captureId)
        ? current.filter((id) => id !== captureId)
        : [...current, captureId],
    );
  }

  return (
    <section>
      <div className="mb-4 space-y-3">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search captures..."
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "new", "analyzed", "processed"] as const).map(
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

          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(event) => setIncludeArchived(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Include archived
          </label>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Recent Captures
      </h2>

      {filteredCaptures.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No captures match this search or filter. The chaos is still there,
          just better hidden.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredCaptures.map((capture) => {
            const progress = getCaptureProgress(capture.analysisJson);
            const isPending = pendingCaptureId === capture.id;
            const isOpen = openCaptureIds.includes(capture.id);
            const isAnalyzed = Boolean(capture.analysisJson);
            const summary = getCaptureSummary(capture);

            return (
              <article
                key={capture.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => toggleCapture(capture.id)}
                    className="flex-1 text-left"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {capture.status}
                      </span>

                      <time className="text-xs text-gray-400">
                        {new Date(capture.createdAt).toLocaleString()}
                      </time>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {isAnalyzed ? "Analyzed Capture" : "New Capture"}
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                      {summary}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCapture(capture.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {isOpen ? "Close" : "Open"}
                  </button>
                </div>

                {progress.readyToProcess && capture.status !== "processed" && (
                  <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                    {progress.createdTasks} task
                    {progress.createdTasks === 1 ? "" : "s"} created ·{" "}
                    {progress.createdNotes} note
                    {progress.createdNotes === 1 ? "" : "s"} created ·{" "}
                    {progress.createdReferences} reference
                    {progress.createdReferences === 1 ? "" : "s"} created ·
                    Ready to process
                  </div>
                )}
                {isOpen && (
                  <div className="mt-4">
                    {isAnalyzed && (
                      <div className="mb-5">
                        <PageQuickActions
                          entityType="capture"
                          entityId={capture.id}
                          userId={userId}
                          tags={tags}
                          notes={notes}
                          references={references}
                          projects={projects}
                          attachedTagIds={capture.attachedTagIds}
                          linkedNoteIds={capture.linkedNoteIds}
                          linkedReferenceIds={capture.linkedReferenceIds}
                          tagSuggestionText={[capture.rawText, summary]
                            .filter(Boolean)
                            .join(" ")}
                        />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800 dark:text-gray-200">
                      {capture.rawText}
                    </p>
                    {capture.analysisJson && (
                      <CaptureAnalysis
                        analysisJson={capture.analysisJson}
                        captureId={capture.id}
                      />
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {!capture.analysisJson && capture.status === "new" ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={async () => {
                        await runCaptureAction(capture.id, () =>
                          analyzeCaptureAction(capture.id),
                        );
                      }}
                      className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
                    >
                      {isPending ? "Analyzing..." : "Analyze"}
                    </button>
                  ) : (
                    <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-400 dark:border-gray-700 dark:text-gray-500">
                      Analyzed
                    </span>
                  )}

                  {progress.readyToProcess &&
                    capture.status !== "processed" && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={async () => {
                          await runCaptureAction(capture.id, () =>
                            markCaptureProcessedAction(capture.id),
                          );
                        }}
                        className="rounded-lg border border-green-300 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950"
                      >
                        {isPending ? "Processing..." : "Mark Processed"}
                      </button>
                    )}

                  {capture.status === "processed" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={async () => {
                        await runCaptureAction(capture.id, () =>
                          archiveCaptureAction(capture.id),
                        );
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      {isPending ? "Archiving..." : "Archive"}
                    </button>
                  )}

                  {capture.status === "archived" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={async () => {
                        if (!confirm("Delete this capture permanently?")) {
                          return;
                        }

                        await runCaptureAction(capture.id, () =>
                          deleteCaptureAction(capture.id),
                        );
                      }}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                    >
                      {isPending ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
