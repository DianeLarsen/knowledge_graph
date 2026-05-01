"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import {
  updateReferenceAction,
  deleteReferenceAction,
} from "@/app/actions/references";
import { getApaCitation, getApaReference } from "@/lib/apa";

type Reference = {
  id: string;
  type: string;
  title: string;
  author: string | null;
  url: string | null;
  notes: string | null;
  publisher?: string | null;
  publishedDate?: Date | string | null;
  linkCount?: number;
};

export default function ReferenceCard({ reference }: { reference: Reference }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showApa, setShowApa] = useState(false);

  const linkCount = reference.linkCount ?? 0;
  const isLinked = linkCount > 0;

  const apaReference = getApaReference(reference);
  const apaCitation = getApaCitation(reference);

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

            <form action={deleteReferenceAction.bind(null, reference.id)}>
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

            <span className="text-xs text-gray-500 dark:text-gray-400">
              Linked to {linkCount} note{linkCount === 1 ? "" : "s"}
            </span>
          </div>

          <h2 className="pr-24 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {reference.title}
          </h2>

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

          <button
            type="button"
            onClick={() => setShowApa((current) => !current)}
            className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showApa ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            APA Reference & Citation
          </button>

          {showApa && (
            <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-950">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  APA Reference
                </p>
                <p className="mt-1 text-gray-800 dark:text-gray-200">
                  {apaReference}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  In-text Citation
                </p>
                <p className="mt-1 text-gray-800 dark:text-gray-200">
                  {apaCitation}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <form action={updateReferenceAction} className="space-y-3">
          <input type="hidden" name="id" value={reference.id} />

          <input
            name="title"
            defaultValue={reference.title}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />

          <input
            name="author"
            defaultValue={reference.author ?? ""}
            placeholder="Author"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />

          <input
            name="url"
            defaultValue={reference.url ?? ""}
            placeholder="URL"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />

          <select
            name="type"
            defaultValue={reference.type}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="book">Book</option>
            <option value="website">Website</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="conversation">Conversation</option>
            <option value="other">Other</option>
          </select>

          <textarea
            name="notes"
            defaultValue={reference.notes ?? ""}
            placeholder="Why this matters"
            rows={4}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
