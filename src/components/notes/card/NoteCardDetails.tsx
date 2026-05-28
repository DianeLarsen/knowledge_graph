"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import LinkedReferenceCard from "@/components/references/LinkedReferenceCard";
import { removeReferenceFromNoteAction } from "@/app/actions/references";
import { getRelationshipLabel } from "@/lib/entityRelationships";
import type {
  Backlink,
  NoteDetails,
  OutgoingLink,
  SharedTagNote,
} from "./noteCardTypes";
import {
  getEventDateLabel,
  getEventStatusLabel,
  getLinkedItemLabel,
  getLinkPillClass,
  getTaskStatusLabel,
} from "./noteCardUtils";
import { getReferenceColorByIndex } from "@/lib/referenceColorClasses";
import { useState } from "react";
import MiniNotePreviewCard from "@/components/notes/card/MiniNotePreviewCard";
import TaskPreviewCard from "@/components/tasks/TaskPreviewCard";
import EventPreviewCard from "@/components/calendar/EventPreviewCard";
import ProjectPreviewCard from "@/components/projects/ProjectPreviewCard";

type NoteCardDetailsProps = {
  noteId: string;
  showDetails: boolean;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  outgoingLinks: OutgoingLink[];
  backlinks: Backlink[];
  sharedTags: SharedTagNote[];
  references: NonNullable<NoteDetails["references"]>;
  userId: string;
  onOpenNote?: (noteId: string) => void;
  router: AppRouterInstance;
};

type LinkedItemPreview =
  | {
      x: number;
      y: number;
      type: "note";
      id?: string;
      title: string;
      content?: string | null;
      relationshipLabel?: string;
      tagName?: string;
    }
  | {
      x: number;
      y: number;
      type: "task";
      id?: string;
      title: string;
      description?: string | null;
      status?: string | null;
      priority?: string | null;
    }
  | {
      x: number;
      y: number;
      type: "event";
      id?: string;
      title: string;
      description?: string | null;
      status?: string | null;
      dateLabel?: string | null;
      location?: string | null;
    }
  | {
      x: number;
      y: number;
      type: "project";
      id?: string;
      title: string;
      description?: string | null;
      role?: string | null;
      itemCount?: number | null;
    }
  | null;

export default function NoteCardDetails({
  noteId,
  showDetails,
  setShowDetails,
  outgoingLinks,
  backlinks,
  sharedTags,
  references,
  userId,
  onOpenNote,
  router,
}: NoteCardDetailsProps) {
  const [linkedItemPreview, setLinkedItemPreview] =
    useState<LinkedItemPreview>(null);
  const [isPreviewPinned, setIsPreviewPinned] = useState(false);

  function getPreviewPosition(
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.FocusEvent<HTMLButtonElement>,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const isMouseEvent = "clientX" in event;

    return {
      x: isMouseEvent ? event.clientX : rect.left,
      y: isMouseEvent ? event.clientY : rect.bottom,
    };
  }

  function openLinkedItem({ type, id }: { type: string; id: string }) {
    if (type === "note") {
      onOpenNote?.(id);
      return;
    }

    if (type === "task") {
      router.push(`/tasks/${id}`);
      return;
    }

    if (type === "event") {
      router.push(`/calendar/${id}`);
      return;
    }

    if (type === "project") {
      router.push(`/projects/${id}`);
    }
  }

  function showLinkedNotePreview({
    event,
    title,
    content,
    relationshipLabel,
    tagName,
    noteId,
    force = false,
  }: {
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.FocusEvent<HTMLButtonElement>;
    title: string;
    subtitle?: string;
    kind?: "outgoing" | "backlink" | "sharedTag";
    content?: string | null;
    relationshipLabel?: string;
    tagName?: string;
    noteId?: string;
    force?: boolean;
  }) {
    if (isPreviewPinned && !force) return;
    const position = getPreviewPosition(event);

    setLinkedItemPreview({
      ...position,
      type: "note",
      id: noteId,
      title,
      content,
      relationshipLabel,
      tagName,
    });
  }

  function hideLinkedItemPreview() {
    if (isPreviewPinned) return;
    setLinkedItemPreview(null);
  }

  function isOutgoingLink(link: OutgoingLink | Backlink): link is OutgoingLink {
    return "targetTitle" in link;
  }

  function showTaskPreview({
    event,
    link,
    force = false,
  }: {
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.FocusEvent<HTMLButtonElement>;
    link: OutgoingLink | Backlink;
    force?: boolean;
  }) {
    if (isPreviewPinned && !force) return;

    const position = getPreviewPosition(event);
    const isOutgoing = isOutgoingLink(link);

    const task = isOutgoing ? link.targetTask : link.sourceTask;

    setLinkedItemPreview({
      ...position,
      type: "task",
      id: isOutgoing ? link.targetId : link.sourceId,
      title: isOutgoing
        ? (link.targetTitle ?? "Untitled task")
        : (link.sourceTitle ?? "Untitled task"),
      description: task?.description ?? null,
      status: task?.status ?? null,
      priority: task?.priority ?? null,
    });
  }

  function showEventPreview({
    event,
    link,
    force = false,
  }: {
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.FocusEvent<HTMLButtonElement>;
    link: OutgoingLink | Backlink;
    force?: boolean;
  }) {
    if (isPreviewPinned && !force) return;

    const position = getPreviewPosition(event);
    const isOutgoing = isOutgoingLink(link);

    const linkedEvent = isOutgoing ? link.targetEvent : link.sourceEvent;

    const rawDateLabel = linkedEvent ? getEventDateLabel(linkedEvent) : null;
    const dateLabel = rawDateLabel ? String(rawDateLabel) : null;

    setLinkedItemPreview({
      ...position,
      type: "event",
      id: isOutgoing ? link.targetId : link.sourceId,
      title: isOutgoing
        ? (link.targetTitle ?? "Untitled event")
        : (link.sourceTitle ?? "Untitled event"),
      description: linkedEvent?.description ?? null,
      status: linkedEvent?.status ?? null,
      dateLabel,
      location: linkedEvent?.location ?? null,
    });
  }

  function showProjectPreview({
    event,
    link,
    force = false,
  }: {
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.FocusEvent<HTMLButtonElement>;
    link: OutgoingLink | Backlink;
    force?: boolean;
  }) {
    if (isPreviewPinned && !force) return;

    const position = getPreviewPosition(event);
    const isOutgoing = isOutgoingLink(link);

    const project = isOutgoing ? link.targetProject : link.sourceProject;

    setLinkedItemPreview({
      ...position,
      type: "project",
      id: isOutgoing ? link.targetId : link.sourceId,
      title: isOutgoing
        ? (link.targetTitle ?? "Untitled project")
        : (link.sourceTitle ?? "Untitled project"),
      description: project?.description ?? null,
      role: null,
      itemCount: null,
    });
  }
  return (
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
                    onClick={(event) => {
                      if (link.targetType === "note") {
                        event.preventDefault();
                        setIsPreviewPinned(true);

                        showLinkedNotePreview({
                          event,
                          title: link.targetTitle ?? "Untitled note",
                          subtitle: getLinkedItemLabel(link),
                          kind: "outgoing",
                          relationshipLabel: getLinkedItemLabel(link),
                          content: link.targetNote?.content ?? null,
                          noteId: link.targetId,
                          force: true,
                        });

                        return;
                      }

                      if (link.targetType === "task") {
                        event.preventDefault();
                        setIsPreviewPinned(true);
                        showTaskPreview({ event, link, force: true });
                        return;
                      }

                      if (link.targetType === "event") {
                        event.preventDefault();
                        setIsPreviewPinned(true);
                        showEventPreview({ event, link, force: true });
                        return;
                      }
                      if (link.targetType === "project") {
                        event.preventDefault();
                        setIsPreviewPinned(true);
                        showProjectPreview({ event, link, force: true });
                        return;
                      }
                      openLinkedItem({
                        type: link.targetType,
                        id: link.targetId,
                      });
                    }}
                    className={`
                      rounded-full border px-3 py-1 text-xs transition
                      ${getLinkPillClass({
                        itemType: link.targetType,
                        taskStatus: link.targetTask?.status,
                        eventStatus: link.targetEvent?.status,
                        direction: "outgoing",
                      })}
                    `}
                    onMouseEnter={(event) => {
                      if (link.targetType === "note") {
                        showLinkedNotePreview({
                          event,
                          title: link.targetTitle ?? "Untitled note",
                          relationshipLabel: getLinkedItemLabel(link),
                          content: link.targetNote?.content ?? null,
                          noteId: link.targetId,
                        });
                        return;
                      }

                      if (link.targetType === "task") {
                        showTaskPreview({ event, link, force: false });
                        return;
                      }

                      if (link.targetType === "event") {
                        showEventPreview({ event, link, force: false });
                        return;
                      }

                      if (link.targetType === "project") {
                        showProjectPreview({ event, link, force: false });
                      }
                    }}
                    onMouseLeave={hideLinkedItemPreview}
                    onFocus={(event) => {
                      if (link.targetType === "note") {
                        showLinkedNotePreview({
                          event,
                          title: link.targetTitle ?? "Untitled note",
                          relationshipLabel: getLinkedItemLabel(link),
                          content: link.targetNote?.content ?? null,
                          noteId: link.targetId,
                        });
                        return;
                      }

                      if (link.targetType === "task") {
                        showTaskPreview({ event, link, force: false });
                        return;
                      }

                      if (link.targetType === "event") {
                        showEventPreview({ event, link, force: false });
                        return;
                      }

                      if (link.targetType === "project") {
                        showProjectPreview({ event, link, force: false });
                      }
                    }}
                    onBlur={hideLinkedItemPreview}
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
                        {link.targetEvent
                          ? String(getEventDateLabel(link.targetEvent) ?? "")
                          : ""}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {backlinks.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                Links back here
              </h2>

              <div className="flex flex-wrap gap-2">
                {backlinks.map((link) => (
                  <button
                    type="button"
                    key={link.id}
                    onClick={(event) => {
                      if (link.sourceType === "note") {
                        event.preventDefault();
                        setIsPreviewPinned(true);

                        showLinkedNotePreview({
                          event,
                          title: link.sourceTitle ?? "Untitled note",
                          relationshipLabel: getRelationshipLabel(
                            link.relationshipType,
                          ),
                          content: link.sourceNote?.content ?? null,
                          noteId: link.sourceId,
                        });

                        return;
                      }

                      if (link.sourceType === "task") {
                        event.preventDefault();
                        setIsPreviewPinned(true);
                        showTaskPreview({ event, link, force: true });
                        return;
                      }

                      if (link.sourceType === "event") {
                        event.preventDefault();
                        setIsPreviewPinned(true);
                        showEventPreview({ event, link, force: true });
                        return;
                      }
                      if (link.sourceType === "project") {
                        event.preventDefault();
                        setIsPreviewPinned(true);
                        showProjectPreview({ event, link, force: true });
                        return;
                      }
                      openLinkedItem({
                        type: link.sourceType,
                        id: link.sourceId,
                      });
                    }}
                    className={`
                      rounded-full border px-3 py-1 text-xs transition
                      ${getLinkPillClass({
                        itemType: link.sourceType,
                        taskStatus: link.sourceTask?.status,
                        eventStatus: link.sourceEvent?.status,
                        direction: "backlink",
                      })}
                    `}
                    onMouseEnter={(event) => {
                      if (link.sourceType === "note") {
                        showLinkedNotePreview({
                          event,
                          title: link.sourceTitle ?? "Untitled note",
                          relationshipLabel: getRelationshipLabel(
                            link.relationshipType,
                          ),
                          content: link.sourceNote?.content ?? null,
                          noteId: link.sourceId,
                        });
                        return;
                      }

                      if (link.sourceType === "task") {
                        showTaskPreview({ event, link, force: false });
                        return;
                      }

                      if (link.sourceType === "event") {
                        showEventPreview({ event, link, force: false });
                        return;
                      }

                      if (link.sourceType === "project") {
                        showProjectPreview({ event, link, force: false });
                      }
                    }}
                    onMouseLeave={hideLinkedItemPreview}
                    onFocus={(event) => {
                      if (link.sourceType === "note") {
                        showLinkedNotePreview({
                          event,
                          title: link.sourceTitle ?? "Untitled note",
                          relationshipLabel: getRelationshipLabel(
                            link.relationshipType,
                          ),
                          content: link.sourceNote?.content ?? null,
                          noteId: link.sourceId,
                        });
                        return;
                      }

                      if (link.sourceType === "task") {
                        showTaskPreview({ event, link, force: false });
                        return;
                      }

                      if (link.sourceType === "event") {
                        showEventPreview({ event, link, force: false });
                        return;
                      }

                      if (link.sourceType === "project") {
                        showProjectPreview({ event, link, force: false });
                      }
                    }}
                    onBlur={hideLinkedItemPreview}
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
                        {link.sourceEvent
                          ? String(getEventDateLabel(link.sourceEvent) ?? "")
                          : ""}
                      </span>
                    )}
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
                    onMouseEnter={(event) =>
                      showLinkedNotePreview({
                        event,
                        title: related.title,
                        relationshipLabel: "Related by shared tag",
                        tagName: related.sharedTagName,
                        noteId: related.id,
                      })
                    }
                    onMouseLeave={hideLinkedItemPreview}
                    onFocus={(event) =>
                      showLinkedNotePreview({
                        event,
                        title: related.title,
                        relationshipLabel: "Related by shared tag",
                        tagName: related.sharedTagName,
                        noteId: related.id,
                      })
                    }
                    onBlur={hideLinkedItemPreview}
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
                {references.map((reference, index) => (
                  <LinkedReferenceCard
                    key={reference.noteReferenceId}
                    reference={reference}
                    noteId={noteId}
                    canRemove={!!userId}
                    onRemoveAction={removeReferenceFromNoteAction}
                    referenceColor={getReferenceColorByIndex(index)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      {linkedItemPreview && (
        <div
          className="fixed z-[9999]"
          style={{
            left: linkedItemPreview.x + 12,
            top: linkedItemPreview.y + 12,
          }}
        >
          {linkedItemPreview.type === "note" && (
            <MiniNotePreviewCard
              title={linkedItemPreview.title}
              content={linkedItemPreview.content}
              relationshipLabel={linkedItemPreview.relationshipLabel}
              tagName={linkedItemPreview.tagName}
              noteId={linkedItemPreview.id}
              onClose={() => {
                setIsPreviewPinned(false);
                setLinkedItemPreview(null);
              }}
              onOpen={(noteId) => {
                onOpenNote?.(noteId);
                setIsPreviewPinned(false);
                setLinkedItemPreview(null);
              }}
            />
          )}

          {linkedItemPreview.type === "task" && (
            <TaskPreviewCard
              title={linkedItemPreview.title}
              description={linkedItemPreview.description}
              status={linkedItemPreview.status}
              priority={linkedItemPreview.priority}
              onClose={() => {
                setIsPreviewPinned(false);
                setLinkedItemPreview(null);
              }}
              onOpen={() => {
                if (linkedItemPreview.id)
                  router.push(`/tasks/${linkedItemPreview.id}`);
                setIsPreviewPinned(false);
                setLinkedItemPreview(null);
              }}
            />
          )}

          {linkedItemPreview.type === "event" && (
            <EventPreviewCard
              title={linkedItemPreview.title}
              description={linkedItemPreview.description}
              status={linkedItemPreview.status}
              dateLabel={linkedItemPreview.dateLabel}
              location={linkedItemPreview.location}
              onClose={() => {
                setIsPreviewPinned(false);
                setLinkedItemPreview(null);
              }}
              onOpen={() => {
                if (linkedItemPreview.id)
                  router.push(`/calendar/${linkedItemPreview.id}`);
                setIsPreviewPinned(false);
                setLinkedItemPreview(null);
              }}
            />
          )}

          {linkedItemPreview.type === "project" && (
            <ProjectPreviewCard
              title={linkedItemPreview.title}
              description={linkedItemPreview.description}
              role={linkedItemPreview.role}
              itemCount={linkedItemPreview.itemCount}
              onClose={() => {
                setIsPreviewPinned(false);
                setLinkedItemPreview(null);
              }}
              onOpen={() => {
                if (linkedItemPreview.id)
                  router.push(`/projects/${linkedItemPreview.id}`);
                setIsPreviewPinned(false);
                setLinkedItemPreview(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
