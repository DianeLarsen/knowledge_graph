"use client";

import { Note, Reference, Tag } from "@/db/schema";
import TagPill from "@/components/TagPill";
import ReadOnlyNoteContent from "@/components/notes/ReadOnlyNoteContent";
import EditNoteForm from "@/components/notes/EditNoteForm";
import { useState } from "react";
import {
  attachReferenceToNoteAction,
  removeReferenceFromNoteAction,
} from "@/app/actions/references";

export type NoteDetails = {
  note: Note;
  tags: Tag[];
  tagStats?: {
    tag: Tag;
    stats: {
      tagId: string;
      tagName: string;
      noteCount: number;
    } | null;
  }[];
  outgoingLinks: OutgoingLink[];
  backlinks: Backlink[];
  sharedTags: SharedTagNote[];
  references?: NoteReferenceCardItem[];
};

type NoteReferenceCardItem = {
  id: string;
  type: Reference["type"];
  title: string;
  author: string | null;
  url: string | null;
  publisher: string | null;
  publishedDate: string | null;
  citation: string | null;
  notes: string | null;

  noteReferenceId: string;
  pageNumber: string | null;
  location: string | null;
  quote: string | null;
  summary: string | null;
};
type OutgoingLink = {
  targetNoteId: string;
  targetTitle: string | null;
  sourceTitle: string | null;
  relationshipType: string;
};

type Backlink = {
  sourceNoteId: string;
  sourceTitle: string | null;
  targetTitle: string | null;
  relationshipType: string;
};

type SharedTagNote = {
  id: string;
  title: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  sharedTagId: string;
  sharedTagName: string;
};
export default function NoteCard({
  data,
  onClose,
  onOpenNote,
  compact = false,

  allTags = [],
  allReferences = [],
  userId,
}: {
  data: NoteDetails;
  onClose?: () => void;
  onOpenNote?: (noteId: string) => void;
  compact?: boolean;

  allTags?: Tag[];
  allReferences?: Reference[];
  userId?: string;
}) {
  const [currentData, setCurrentData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const {
    note,
    tags,
    outgoingLinks,
    backlinks,
    sharedTags,
    tagStats,
    references = [],
  } = currentData;
const attachedReferenceIds = new Set(
  references.map((reference) => reference.id),
);

const availableReferences = allReferences.filter(
  (reference) => !attachedReferenceIds.has(reference.id),
);
  return (
    <div className={compact ? "w-full" : "mx-auto w-full max-w-3xl"}>
      <article
        className={`
    relative w-full border bg-white
    ${
      compact
        ? "border-gray-300 shadow-[4px_4px_0_rgba(0,0,0,0.05)]"
        : "border-gray-200 shadow-[8px_8px_0_rgba(0,0,0,0.06),16px_16px_0_rgba(0,0,0,0.04),24px_24px_0_rgba(0,0,0,0.03)]"
    }
    dark:border-gray-800 dark:bg-gray-950
  `}
      >
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          {userId && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="
      flex h-6 w-6 items-center justify-center
      rounded-full border border-gray-300 bg-white
      text-xs font-bold text-gray-600 shadow-sm transition
      hover:border-blue-400 hover:bg-blue-100 hover:text-blue-700
      dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
      dark:hover:border-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-200
    "
              title="Edit note"
            >
              ✎
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${note.title}`}
              className="
        flex h-6 w-6 items-center justify-center
        rounded-full border border-gray-300 bg-white
        text-sm font-bold text-gray-600
        shadow-sm transition
        hover:border-red-400 hover:bg-red-500 hover:text-white
        dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
        dark:hover:border-red-400 dark:hover:bg-red-500 dark:hover:text-white
      "
            >
              ×
            </button>
          )}
        </div>
        {tagStats?.length ? (
          <div className="mb-3 flex flex-wrap gap-2 px-3 pt-3">
            {tagStats.map(({ tag, stats }) => (
              <TagPill key={tag.id} tag={tag} stats={stats} />
            ))}
          </div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 px-3 pt-3 pb-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="
          rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5
          text-xs text-gray-700
          dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200
        "
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}

        <IndexLine isRed>
          <h1 className="font-['Comic_Sans_MS','Bradley_Hand',cursive] text-2xl font-semibold text-gray-950 dark:text-gray-100">
            {note.title}
          </h1>
        </IndexLine>

        <div
          className="
    min-h-40 px-4 py-0
bg-[linear-gradient(to_bottom,transparent_31px,#93c5fd_32px)]
bg-[length:100%_32px]
dark:bg-[linear-gradient(to_bottom,transparent_31px,#60a5fa_32px)]
  "
        >
          <ReadOnlyNoteContent
            key={note.contentJson ?? note.content ?? note.updatedAt.toString()}
            content={note.contentJson}
          />
        </div>
        <div className="border-t border-blue-200 px-4 py-3 text-sm dark:border-blue-800">
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            className="
      rounded-full border border-gray-300 bg-gray-50 px-3 py-1
      text-xs font-medium text-gray-700 transition
      hover:bg-gray-100
      dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200
      dark:hover:bg-gray-800
    "
          >
            {showDetails ? "Hide additional info" : "Show additional info"}
          </button>

          {showDetails && (
            <div className="mt-4 space-y-4">
              {outgoingLinks.length > 0 && (
                <section>
                  <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                    This note links to
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {outgoingLinks.map((link) => (
                      <button
                        type="button"
                        key={`${link.targetNoteId}-${link.relationshipType}`}
                        onClick={() => onOpenNote?.(link.targetNoteId)}
                        className="
                  rounded-full border border-blue-200 bg-blue-50 px-3 py-1
                  text-xs text-blue-700 hover:bg-blue-100
                  dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300
                  dark:hover:bg-blue-900
                "
                      >
                        {link.targetTitle ?? "Untitled note"}
                        <span className="ml-1 text-[10px] opacity-70">
                          ({link.relationshipType})
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {backlinks.length > 0 && (
                <section>
                  <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                    Notes that link here
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {backlinks.map((link) => (
                      <button
                        type="button"
                        key={`${link.sourceNoteId}-${link.relationshipType}`}
                        onClick={() => onOpenNote?.(link.sourceNoteId)}
                        className="
                  rounded-full border border-purple-200 bg-purple-50 px-3 py-1
                  text-xs text-purple-700 hover:bg-purple-100
                  dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300
                  dark:hover:bg-purple-900
                "
                      >
                        {link.sourceTitle ?? "Untitled note"}
                        <span className="ml-1 text-[10px] opacity-70">
                          ({link.relationshipType})
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {sharedTags.length > 0 && (
                <section>
                  <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                    Related by tag
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {sharedTags.map((related) => (
                      <button
                        type="button"
                        key={`${related.id}-${related.sharedTagId}`}
                        onClick={() => onOpenNote?.(related.id)}
                        className="
                  rounded-full border border-gray-200 bg-gray-50 px-3 py-1
                  text-xs text-gray-700 hover:bg-gray-100
                  dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
                  dark:hover:bg-gray-800
                "
                      >
                        {related.title}
                        <span className="ml-1 text-[10px] text-gray-500">
                          #{related.sharedTagName}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {userId && availableReferences.length > 0 && (
                <section>
                  <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                    Add Reference
                  </h2>

                  <form
                    action={attachReferenceToNoteAction}
                    className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <input type="hidden" name="noteId" value={note.id} />

                    <select
                      name="referenceId"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a reference
                      </option>

                      {availableReferences.map((reference) => (
                        <option key={reference.id} value={reference.id}>
                          {reference.title}
                        </option>
                      ))}
                    </select>

                    <input
                      name="pageNumber"
                      placeholder="Page number, optional"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                    />

                    <textarea
                      name="summary"
                      placeholder="Why this reference matters for this note, optional"
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                    />

                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Attach Reference
                    </button>
                  </form>
                </section>
              )}
              {references.length > 0 && (
                <section>
                  <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                    References
                  </h2>

                  <div className="space-y-2">
                    {references.map((reference) => (
                      <div
                        key={reference.noteReferenceId}
                        className="
                  rounded-lg border border-amber-200 bg-amber-50 px-3 py-2
                  text-xs text-amber-900
                  dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200
                "
                      >
                        <p className="font-semibold">{reference.title}</p>

                        {reference.author && (
                          <p className="opacity-80">
                            Author: {reference.author}
                          </p>
                        )}

                        {reference.pageNumber && (
                          <p className="opacity-80">
                            Page: {reference.pageNumber}
                          </p>
                        )}

                        {reference.quote && (
                          <p className="mt-1 italic">“{reference.quote}”</p>
                        )}

                        {reference.summary && (
                          <p className="mt-1">{reference.summary}</p>
                        )}

                        {reference.url && (
                          <a
                            href={reference.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block underline"
                          >
                            Open reference
                          </a>
                        )}
                        {userId && (
                          <form
                            action={removeReferenceFromNoteAction}
                            className="mt-2"
                          >
                            <input
                              type="hidden"
                              name="noteId"
                              value={note.id}
                            />
                            <input
                              type="hidden"
                              name="referenceId"
                              value={reference.id}
                            />

                            <button
                              type="submit"
                              className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                            >
                              Remove from note
                            </button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
        <IndexLine />
      </article>
      {isEditing && userId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-950">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="
          absolute right-3 top-3 z-10
          flex h-7 w-7 items-center justify-center
          rounded-full border border-gray-300 bg-white
          text-sm font-bold text-gray-600 shadow-sm
          hover:border-red-400 hover:bg-red-500 hover:text-white
          dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
        "
            >
              ×
            </button>

            <EditNoteForm
              note={note}
              tags={allTags}
              noteTags={tags}
              references={allReferences}
              noteReferences={currentData.references ?? []}
              userId={userId}
              onCancel={() => setIsEditing(false)}
              onSave={(updatedNote) => {
                setCurrentData((current) => ({
                  ...current,
                  note: {
                    ...current.note,
                    ...updatedNote,
                  },
                }));

                setIsEditing(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function IndexLine({
  children,
  isRed = false,
}: {
  children?: React.ReactNode;
  isRed?: boolean;
}) {
  return (
    <div
      className={`
        flex min-h-10 items-end px-4 pl-4
        border-b
        ${
          isRed
            ? "border-red-400 dark:border-red-400"
            : "border-blue-300 dark:border-blue-400"
        }
      `}
    >
      <div className="translate-y-1 break-words">{children}</div>
    </div>
  );
}
