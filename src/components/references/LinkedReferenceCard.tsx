"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import ApaCitationPanel from "./ApaCitationPanel";
import type { NoteLinkedReference } from "@/lib/types/references/referenceTypes";
import {
  referenceColorClassMap,
  type ReferenceColor,
} from "@/lib/referenceColorClasses";

type LinkedReferenceCardProps = {
  reference: NoteLinkedReference;
  noteId?: string;
  canRemove?: boolean;
  onRemoveAction?: (formData: FormData) => Promise<unknown>;
  referenceColor?: ReferenceColor;
};

export default function LinkedReferenceCard({
  reference,
  noteId,
  canRemove = false,
  onRemoveAction,
  referenceColor = "slate",
}: LinkedReferenceCardProps) {

  const isAnchored = !!reference.quote || !!reference.summary;
  const referenceColorClasses =
    referenceColorClassMap[referenceColor].join(" ");
  const router = useRouter();
  return (
    <div
      className={`group rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 shadow-sm ring-1 transition hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700 ${referenceColorClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[rgb(var(--text))]">
              {reference.title}
            </p>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${referenceColorClasses}`}
            >
              {isAnchored ? "Anchored" : "General"}
            </span>
          </div>

          {reference.author && (
            <p className="mt-1 text-xs text-[rgb(var(--muted))]">
              {reference.author}
            </p>
          )}

          {reference.pageNumber && (
            <p className="mt-1 text-xs text-[rgb(var(--muted))]">
              Page {reference.pageNumber}
            </p>
          )}
        </div>

        {canRemove && noteId && onRemoveAction && (
          <form
            action={async (formData) => {
              await onRemoveAction(formData);
              router.refresh();
            }}
          >
            <input type="hidden" name="noteId" value={noteId} />
            <input type="hidden" name="referenceId" value={reference.id} />

            <button
              type="submit"
              title="Remove from note"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
            >
              <Trash2 size={15} />
            </button>
          </form>
        )}
      </div>

      {reference.quote && (
        <blockquote className="mt-3 rounded-xl border-l-2 border-blue-300 bg-slate-100/70 px-3 py-2 text-xs italic text-[rgb(var(--text))] dark:border-blue-700 dark:bg-slate-900">
          “{reference.quote}”
        </blockquote>
      )}

      {reference.summary && (
        <div className="mt-3 rounded-xl bg-slate-100/70 px-3 py-2 text-xs text-[rgb(var(--text))] dark:bg-slate-900">
          <span className="font-semibold">Why it matters:</span>{" "}
          {reference.summary}
        </div>
      )}
      <ApaCitationPanel reference={reference} />
      {reference.url && (
        <a
          href={reference.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          <ExternalLink size={12} />
          Open reference
        </a>
      )}
    </div>
  );
}
