"use client";

import { Note, Reference, Tag, type RelationshipType } from "@/db/schema";
import TagPill from "@/components/notes/TagPill";
import ReadOnlyNoteContent from "@/components/notes/ReadOnlyNoteContent";
import EditNoteForm from "@/components/notes/EditNoteForm";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TagColor } from "@/lib/types/tags/tagColors";
import { getRelationshipLabel } from "@/lib/entityRelationships";
import LinkedReferenceCard from "@/components/references/LinkedReferenceCard";
import { removeReferenceFromNoteAction } from "@/app/actions/references";
import type { NoteLinkedReference } from "@/lib/types/references/referenceTypes";

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
  references?: NoteLinkedReference[];
};

type LinkedTaskSummary = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "awaiting" | "done" | "archived";
};

type LinkedEventSummary = {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  status: "planned" | "done" | "cancelled";
};

type OutgoingLink = {
  id: string;
  relationshipType: RelationshipType;
  label: string | null;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;

  targetTitle: string | null;
  targetContent: string | null;

  targetTask?: LinkedTaskSummary | null;
  targetEvent?: LinkedEventSummary | null;
};

type Backlink = {
  id: string;
  relationshipType: RelationshipType;
  label: string | null;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;

  sourceTitle: string | null;
  sourceContent: string | null;

  sourceTask?: LinkedTaskSummary | null;
  sourceEvent?: LinkedEventSummary | null;
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

function getLinkedItemLabel(link: {
  relationshipType: RelationshipType;
  targetType?: string;
  sourceType?: string;
}) {
  return getRelationshipLabel(link.relationshipType);
}

function getTaskStatusLabel(status: LinkedTaskSummary["status"]) {
  if (status === "done") return "Complete";
  if (status === "in_progress") return "In progress";
  if (status === "awaiting") return "Awaiting";
  if (status === "archived") return "Archived";
  return "To do";
}

function getEventStatusLabel(status: LinkedEventSummary["status"]) {
  if (status === "done") return "Past";
  if (status === "cancelled") return "Cancelled";
  return "Planned";
}

function getEventDateLabel(event: LinkedEventSummary) {
  if (!event.endDate || event.endDate === event.startDate) {
    return event.startDate;
  }

  return `${event.startDate} → ${event.endDate}`;
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

 const tagLimit = compact ? compactTagLimit : 8;

 const shouldCollapseTags = sortedTags.length > tagLimit;

 const maxVisibleTags = shouldCollapseTags
   ? Math.max(tagLimit, inlineTagIds.size)
   : sortedTags.length;

 const visibleTags = sortedTags.slice(0, maxVisibleTags);
 const hiddenTags = shouldCollapseTags ? sortedTags.slice(maxVisibleTags) : [];

  const referenceOptions = userReferences;

  return (
    <div className={compact ? "w-full" : "mx-auto w-full max-w-3xl"}>
      <article
        className={`
          relative isolate w-full border bg-white
          ${
            compact
              ? "border-gray-300 shadow-[4px_4px_0_rgba(0,0,0,0.05)]"
              : "border-gray-200 shadow-[8px_8px_0_rgba(0,0,0,0.06),16px_16px_0_rgba(0,0,0,0.04),24px_24px_0_rgba(0,0,0,0.03)]"
          }
          dark:border-gray-800 dark:bg-gray-950
        `}
      >
        <div className="absolute right-2 top-2 z-50 flex items-center gap-1">
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
            ${compact ? "h-[180px] pb-2 pt-0" : "min-h-[150px] pb-2 pt-0"}
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
    ${compact ? "min-h-full" : "min-h-[150px]"}
    bg-[linear-gradient(to_bottom,transparent_27px,#93c5fd_28px,transparent_29px)]
    bg-[length:100%_30px]
    bg-[position:0_0px]
    dark:bg-[linear-gradient(to_bottom,transparent_27px,#60a5fa_28px,transparent_29px)]
  `}
          >
            <div
              className="
                pt-[5.75px]
                text-sm leading-[30px]

                [&_p]:m-0
                [&_p]:min-h-[30px]
                [&_p]:leading-[30px]

                [&_span]:leading-[inherit]
                [&_a]:leading-[inherit]
                [&_mark]:leading-[inherit]

                [&_.tag-mark]:inline
                [&_.tag-mark]:align-baseline
                [&_.tag-mark]:leading-[inherit]

                [&_.reference-mark]:inline
                [&_.reference-mark]:align-baseline
                [&_.reference-mark]:leading-[inherit]

                [&_[data-tag-name]]:inline
                [&_[data-tag-name]]:align-baseline
                [&_[data-tag-name]]:leading-[inherit]
              "
            >
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
                    {outgoingLinks.map((link) => {
                      const isTask = link.targetType === "task";
                      const isEvent = link.targetType === "event";
                      const isDoneTask = link.targetTask?.status === "done";
                      const isPastEvent = link.targetEvent?.status === "done";

                      return (
                        <button
                          type="button"
                          key={link.id}
                          onClick={() => {
                            if (link.targetType === "note") {
                              onOpenNote?.(link.targetId);
                              return;
                            }

                            if (link.targetType === "task") {
                              router.push(`/tasks#${link.targetId}`);
                              return;
                            }

                            if (link.targetType === "event") {
                              router.push(`/calendar#${link.targetId}`);
                            }
                          }}
                          className={`
                            rounded-full border px-3 py-1 text-xs transition
                            ${
                              isTask
                                ? isDoneTask
                                  ? "border-green-300 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                                  : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                : isEvent
                                  ? isPastEvent
                                    ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                    : "border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200"
                                  : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }
                          `}
                        >
                          {link.targetTitle ?? `Untitled ${link.targetType}`}

                          <span className="ml-1 text-[10px] opacity-70">
                            ({getLinkedItemLabel(link)})
                          </span>

                          {link.targetTask && (
                            <span className="ml-1 text-[10px] font-semibold opacity-80">
                              · {getTaskStatusLabel(link.targetTask.status)}
                            </span>
                          )}

                          {link.targetEvent && (
                            <span className="ml-1 text-[10px] font-semibold opacity-80">
                              · {getEventStatusLabel(link.targetEvent.status)} ·{" "}
                              {getEventDateLabel(link.targetEvent)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {backlinks.map((link) => {
                const isTask = link.sourceType === "task";
                const isEvent = link.sourceType === "event";
                const isDoneTask = link.sourceTask?.status === "done";
                const isPastEvent = link.sourceEvent?.status === "done";

                return (
                  <button
                    type="button"
                    key={link.id}
                    onClick={() => {
                      if (link.sourceType === "note") {
                        onOpenNote?.(link.sourceId);
                        return;
                      }

                      if (link.sourceType === "task") {
                        router.push(`/tasks#${link.sourceId}`);
                        return;
                      }

                      if (link.sourceType === "event") {
                        router.push(`/calendar#${link.sourceId}`);
                      }
                    }}
                    className={`
                      rounded-full border px-3 py-1 text-xs transition
                      ${
                        isTask
                          ? isDoneTask
                            ? "border-green-300 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                            : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                          : isEvent
                            ? isPastEvent
                              ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                              : "border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200"
                            : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
                      }
                    `}
                  >
                    {link.sourceTitle ?? `Untitled ${link.sourceType}`}

                    <span className="ml-1 text-[10px] opacity-70">
                      ({getRelationshipLabel(link.relationshipType)})
                    </span>

                    {link.sourceTask && (
                      <span className="ml-1 text-[10px] font-semibold opacity-80">
                        · {getTaskStatusLabel(link.sourceTask.status)}
                      </span>
                    )}

                    {link.sourceEvent && (
                      <span className="ml-1 text-[10px] font-semibold opacity-80">
                        · {getEventStatusLabel(link.sourceEvent.status)} ·{" "}
                        {getEventDateLabel(link.sourceEvent)}
                      </span>
                    )}
                  </button>
                );
              })}

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

              {references.length > 0 && (
                <section>
                  <h2 className="mb-2 font-semibold text-[rgb(var(--text))]">
                    References
                  </h2>

                  <div className="space-y-2">
                    {references.map((reference) => (
                      <LinkedReferenceCard
                        key={reference.noteReferenceId}
                        reference={reference}
                        noteId={note.id}
                        canRemove={!!userId}
                        onRemoveAction={removeReferenceFromNoteAction}
                      />
                    ))}
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
              linkedNoteIds={outgoingLinks.map((link) => link.targetId)}
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
