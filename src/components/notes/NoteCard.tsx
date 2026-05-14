"use client";

import { Note, Reference, Tag, type RelationshipType } from "@/db/schema";
import TagPill from "@/components/notes/TagPill";
import ReadOnlyNoteContent from "@/components/notes/ReadOnlyNoteContent";
import EditNoteForm from "@/components/notes/EditNoteForm";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TagColor } from "@/lib/tags/tagColors";
import {
  attachReferenceToNoteAction,
  removeReferenceFromNoteAction,
} from "@/app/actions/references";
import { getRelationshipLabel } from "@/lib/entityRelationships";

type LinkedNoteSummary = {
  id: string;
  title: string;
};

type NoteCardTag = Tag & {
  color: TagColor | null;
};

export type NoteDetails = {
  note: Note;
  tags: NoteCardTag[];
  tagStats?: {
    tag: NoteCardTag;
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
  id: string;
  relationshipType: RelationshipType;
  label: string | null;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  targetNoteId: string;
  targetTitle: string | null;
  targetContent: string | null;
};

type Backlink = {
  id: string;
  relationshipType: RelationshipType;
  label: string | null;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  sourceNoteId: string;
  sourceTitle: string | null;
  sourceContent: string | null;
};

type SharedTagNote = {
  id: string;
  title: string;
  content: string | null;
  contentJson: string | null;
  createdByUserId: string;
  ownerType: "user" | "project";
  ownerId: string;
  visibility: "private" | "shared" | "public";
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  sharedTagId: string;
  sharedTagName: string;
};

type RichTextNode = {
  type?: string;
  attrs?: {
    tagId?: string;
    id?: string;
  };
  marks?: {
    type?: string;
    attrs?: {
      tagId?: string;
    };
  }[];
  content?: RichTextNode[];
};

function getInlineTagIds(contentJson: string | null) {
  if (!contentJson) return new Set<string>();

  try {
    const doc: RichTextNode = JSON.parse(contentJson);
    const ids = new Set<string>();

    function walk(node: RichTextNode) {
      if (!node) return;

      if (Array.isArray(node.marks)) {
        node.marks.forEach((mark) => {
          if (mark.type === "tagMark" && mark.attrs?.tagId) {
            ids.add(mark.attrs.tagId);
          }
        });
      }

      if (node.type === "mention" && node.attrs?.id) {
        ids.add(node.attrs.id);
      }

      if (Array.isArray(node.content)) {
        node.content.forEach(walk);
      }
    }

    walk(doc);

    return ids;
  } catch {
    return new Set<string>();
  }
}

export default function NoteCard({
  data,
  onClose,
  onOpenNote,
  compact = false,
  allNotes = [],
  userId,
  userTags = [],
  userReferences = [],
  compactShouldScroll = false,
  compactTagLimit = 3,
}: {
  data: NoteDetails;
  onClose?: () => void;
  onOpenNote?: (noteId: string) => void;
  compact?: boolean;
  allNotes?: LinkedNoteSummary[];
  userTags?: NoteCardTag[];
  userReferences?: Reference[];
  userId: string;
  compactShouldScroll?: boolean;
  compactTagLimit?: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const {
    note,
    tags,
    outgoingLinks,
    backlinks,
    sharedTags,
    tagStats,
    references = [],
  } = data;

  const inlineTagIds = getInlineTagIds(note.contentJson);

  const sortedTags = [...tags].sort((a, b) => {
    const aLinked = inlineTagIds.has(a.id);
    const bLinked = inlineTagIds.has(b.id);

    if (aLinked && !bLinked) return -1;
    if (!aLinked && bLinked) return 1;

    return a.name.localeCompare(b.name);
  });

  const tagColorMap = new Map<string, TagColor>();

  sortedTags.forEach((tag) => {
    tagColorMap.set(tag.id, tag.color ?? "blue");
  });

  const shouldCollapseTags = compact && sortedTags.length > compactTagLimit;
  const maxVisibleTags = shouldCollapseTags
    ? Math.max(compactTagLimit, inlineTagIds.size)
    : sortedTags.length;

  const visibleTags = sortedTags.slice(0, maxVisibleTags);
  const hiddenTags = shouldCollapseTags ? sortedTags.slice(maxVisibleTags) : [];
  const attachedReferenceIds = new Set(
    references.map((reference) => reference.id),
  );

  const referenceOptions = userReferences;

  const availableReferences = referenceOptions.filter(
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
        {tags.length > 0 && (
          <div className="relative flex h-11 items-start px-1 pb-1 pt-3 pr-16">
            <div className="flex min-w-0 flex-nowrap items-center gap-1">
              {visibleTags.map((tag) => {
                const stats =
                  tagStats?.find((item) => item.tag.id === tag.id)?.stats ??
                  null;

                return (
                  <TagPill
                    key={tag.id}
                    tag={tag}
                    stats={stats}
                    size="card"
                    linked={inlineTagIds.has(tag.id)}
                    color={tag.color ?? "blue"}
                    onJumpToInlineTag={(tagId) => {
                      document
                        .querySelector(`[data-inline-tag-id="${tagId}"]`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  />
                );
              })}

              {hiddenTags.length > 0 && (
                <div className="group relative shrink-0">
                  <button
                    type="button"
                    className="
        rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5
        text-[13px] font-medium text-gray-700 shadow-sm transition
        hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700
        dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200
        dark:hover:border-blue-400 dark:hover:bg-blue-900/40
        dark:hover:text-blue-200
      "
                    aria-label={`Show ${hiddenTags.length} more tags`}
                  >
                    +{hiddenTags.length}
                  </button>

                  <div
                    className="
        pointer-events-none absolute left-0 top-full z-50 mt-2
        min-w-max rounded-xl border border-gray-200 bg-white p-2
        text-left opacity-0 shadow-lg transition
        group-hover:pointer-events-auto group-hover:opacity-100
        dark:border-gray-700 dark:bg-gray-900
      "
                  >
                    <div className="space-y-1">
                      {hiddenTags.map((tag) => {
                        const stats =
                          tagStats?.find((item) => item.tag.id === tag.id)
                            ?.stats ?? null;

                        return (
                          <div
                            key={tag.id}
                            className="
                flex items-center justify-between gap-3 rounded-lg px-2 py-1
                text-sm text-gray-700
                dark:text-gray-200
              "
                          >
                            <span className="whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  document
                                    .querySelector(
                                      `[data-inline-tag-id="${tag.id}"]`,
                                    )
                                    ?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "center",
                                    });
                                }}
                                className="whitespace-nowrap underline decoration-dotted"
                              >
                                #{tag.name}
                              </button>
                            </span>

                            <span className="shrink-0 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                              Cards with this tag: {stats?.noteCount ?? 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <IndexLine isRed compact={compact} className="relative z-10">
          <h1
            className={`
    font-['Comic_Sans_MS','Bradley_Hand',cursive] font-semibold
  text-gray-900 dark:text-slate-100
    ${compact ? "text-xl leading-7" : "text-2xl leading-8"}
  `}
          >
            {note.title}
          </h1>
        </IndexLine>

        <div
          className={`
    ${compact ? "h-[180px] pb-2 pt-0" : "min-h-40 pb-2 pt-0"}
    ${
      compact && compactShouldScroll
        ? "overflow-y-auto scrollbar-gutter-stable custom-scrollbar"
        : compact
          ? "overflow-hidden"
          : ""
    }
  `}
        >
          <div
            className={`
      min-h-full
      bg-[linear-gradient(to_bottom,transparent_27px,#93c5fd_28px,transparent_29px)]
      bg-[length:100%_30px]
      bg-[position:0_0px]
      dark:bg-[linear-gradient(to_bottom,transparent_27px,#60a5fa_28px,transparent_29px)]
    `}
          >
            <div className="-translate-y-2.5 text-sm leading-[30px] [&_p]:m-0 [&_p]:leading-[30px]">
              <ReadOnlyNoteContent
                key={
                  note.contentJson ?? note.content ?? note.updatedAt.toString()
                }
                content={note.contentJson}
                references={references.map((reference) => ({
                  id: reference.id,
                  title: reference.title,
                  author: reference.author,
                  url: reference.url,
                  notes: reference.notes,
                }))}
                tags={tags.map((tag) => ({
                  id: tag.id,
                  name: tag.name,
                  color: tag.color,
                }))}
                tagColorMap={Object.fromEntries(tagColorMap)}
              />
            </div>
          </div>
        </div>
        <div className="px-4 py-3 text-sm">
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
                        key={link.id}
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
                          ({getRelationshipLabel(link.relationshipType)})
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
                        key={link.id}
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
                          ({getRelationshipLabel(link.relationshipType)})
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
                    action={async (formData) => {
                      await attachReferenceToNoteAction(formData);
                    }}
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
                    {references.map((reference) => {
                      const isAnchored =
                        !!reference.quote || !!reference.summary;
                      return (
                        <div
                          key={reference.noteReferenceId}
                          className="
                  rounded-lg border border-amber-200 bg-amber-50 px-3 py-2
                  text-xs text-amber-900
                  dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200
                "
                        >
                          <p className="font-semibold">{reference.title}</p>
                          <p
                            className={`text-xs ${
                              isAnchored
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {isAnchored
                              ? "Linked to text"
                              : "General reference"}
                          </p>
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
                            <p className="mt-1 font-medium text-gray-800 dark:text-gray-200">
                              Why it matters: {reference.summary}
                            </p>
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
                              action={async (formData) => {
                                await removeReferenceFromNoteAction(formData);
                              }}
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
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
        {!compact && <IndexLine />}
      </article>
      {isEditing && userId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-950">
            <EditNoteForm
              note={note}
              tags={userTags}
              noteTags={tags}
              references={referenceOptions}
              noteReferences={data.references ?? []}
              onCancel={() => setIsEditing(false)}
              onSave={() => {
                setIsEditing(false);
                router.refresh();
              }}
              availableNotes={allNotes}
              linkedNoteIds={outgoingLinks.map((link) => link.targetNoteId)}
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
  compact = false,
  className = "",
}: {
  children?: React.ReactNode;
  isRed?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`
        flex items-end border-b px-4
        ${compact ? "min-h-9" : "min-h-10"}
        ${
          isRed
            ? "border-red-400 dark:border-red-400"
            : "border-blue-300 dark:border-blue-400"
        }
        ${className}
      `}
    >
      <div className="translate-y-[3px] break-words">{children}</div>
    </div>
  );
}
