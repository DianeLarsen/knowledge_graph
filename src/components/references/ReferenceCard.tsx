"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteReferenceAction } from "@/app/actions/references";
import Link from "next/link";
import EditReferenceForm from "@/components/references/EditReferenceForm";
import ApaCitationPanel from "@/components/references/ApaCitationPanel";
import type { ReferenceCardItem } from "@/lib/types/references/referenceTypes";

export type Reference = {
  id: string;
  type: string;
  title: string;
  author: string | null;
  url: string | null;
  notes: string | null;
  publisher?: string | null;
  publishedDate?: Date | string | null;
  linkCount?: number;
  linkedNotes?: {
    id: string;
    title: string;
    content: string | null;
  }[];
  linkedTasks?: {
    id: string;
    title: string;
    description: string | null;
  }[];
  linkedCaptures?: {
    id: string;
    title?: string | null;
    summary?: string | null;
  }[];
  linkedReferences?: {
    id: string;
    title: string;
  }[];
};

export default function ReferenceCard({
  reference,
}: {
  reference: ReferenceCardItem;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkedNotes, setShowLinkedNotes] = useState(false);

  const noteCount = reference.linkedNotes?.length ?? 0;
  const taskCount = reference.linkedTasks?.length ?? 0;
  const captureCount = reference.linkedCaptures?.length ?? 0;
  const referenceCount = reference.linkedReferences?.length ?? 0;

  const totalLinkCount =
    reference.linkCount ??
    noteCount + taskCount + captureCount + referenceCount;

  const isLinked = totalLinkCount > 0;

  return (
    <article className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {!isEditing ? (
        <>
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit reference"
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <form
              action={async () => {
                await deleteReferenceAction(reference.id);
              }}
            >
              <button
                type="submit"
                disabled={isLinked}
                title={
                  isLinked
                    ? "Remove this reference from linked notes before deleting."
                    : "Delete reference"
                }
                onClick={(event) => {
                  if (isLinked) {
                    event.preventDefault();
                    return;
                  }

                  if (!confirm("Delete this reference permanently?")) {
                    event.preventDefault();
                  }
                }}
                className={`rounded-lg border p-2 ${
                  isLinked
                    ? "cursor-not-allowed border-gray-200 text-gray-300 dark:border-gray-800 dark:text-gray-600"
                    : "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                }`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2 pr-24">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {reference.type}
            </span>

            <div className="relative inline-flex">
              <button
                type="button"
                disabled={totalLinkCount === 0}
                onClick={() => setShowLinkedNotes((current) => !current)}
                className={`text-xs underline decoration-dotted underline-offset-2 ${
                  totalLinkCount === 0
                    ? "cursor-default text-gray-400 no-underline dark:text-gray-600"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Linked to {noteCount} note{noteCount === 1 ? "" : "s"},{" "}
                {taskCount} task{taskCount === 1 ? "" : "s"}, {captureCount}{" "}
                capture{captureCount === 1 ? "" : "s"}, {referenceCount}{" "}
                reference{referenceCount === 1 ? "" : "s"}
              </button>

              {showLinkedNotes &&
                reference.linkedNotes &&
                reference.linkedNotes.length > 0 && (
                  <div className="absolute left-0 top-6 z-30 w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-950">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Linked Items
                      </p>

                      <button
                        type="button"
                        onClick={() => setShowLinkedNotes(false)}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-2">
                      {reference.linkedNotes.map((note) => (
                        <div key={note.id} className="group relative">
                          <a
                            href={`/notes/${note.id}`}
                            className="block rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-700 hover:bg-gray-100 dark:text-blue-300 dark:hover:bg-gray-800"
                          >
                            {note.title}
                          </a>

                          <div className="absolute left-full top-0 z-40 ml-2 hidden w-80 rounded-2xl border border-blue-200 bg-white p-4 text-xs shadow-lg group-hover:block dark:border-blue-900 dark:bg-gray-900">
                            <div className="mb-2 border-b border-red-200 pb-2 dark:border-red-900">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {note.title}
                              </p>
                            </div>

                            <p className="line-clamp-6 whitespace-pre-wrap leading-5 text-gray-700 dark:text-gray-300">
                              {note.content || "No content yet."}
                            </p>

                            <p className="mt-3 text-[11px] font-semibold text-blue-600 dark:text-blue-300">
                              Click title to open note
                            </p>
                          </div>
                        </div>
                      ))}
                      {reference.linkedTasks &&
                        reference.linkedTasks.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Tasks
                            </p>

                            {reference.linkedTasks.map((task) => (
                              <a
                                key={task.id}
                                href={`/tasks#task-${task.id}`}
                                className="block rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-700 hover:bg-gray-100 dark:text-blue-300 dark:hover:bg-gray-800"
                              >
                                {task.title}
                              </a>
                            ))}
                          </div>
                        )}
                      {reference.linkedCaptures &&
                        reference.linkedCaptures.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Captures
                            </p>

                            {reference.linkedCaptures.map((capture) => (
                              <a
                                key={capture.id}
                                href={`/capture#capture-${capture.id}`}
                                className="block rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-700 hover:bg-gray-100 dark:text-blue-300 dark:hover:bg-gray-800"
                              >
                                {capture.title ??
                                  capture.summary ??
                                  "Untitled capture"}
                              </a>
                            ))}
                          </div>
                        )}
                      {reference.linkedReferences &&
                        reference.linkedReferences.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              References
                            </p>

                            {reference.linkedReferences.map(
                              (linkedReference) => (
                                <a
                                  key={linkedReference.id}
                                  href={`/references/${linkedReference.id}?from=/references/${reference.id}`}
                                  className="block rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-700 hover:bg-gray-100 dark:text-blue-300 dark:hover:bg-gray-800"
                                >
                                  {linkedReference.title}
                                </a>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          <Link
            href={`/references/${reference.id}?from=/references`}
            className="block pr-24 text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-300"
          >
            {reference.title}
          </Link>

          {reference.author && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {reference.author}
            </p>
          )}

          {reference.url && (
            <a
              href={reference.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block break-all text-sm text-blue-600 underline dark:text-blue-300"
            >
              {reference.url}
            </a>
          )}

          {reference.notes && (
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
              <p className="font-semibold">Why this matters</p>
              <p className="mt-1">{reference.notes}</p>
            </div>
          )}

          <ApaCitationPanel reference={reference} />
        </>
      ) : (
        <EditReferenceForm
          reference={reference}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </article>
  );
}
