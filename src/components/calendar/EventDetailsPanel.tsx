"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Pencil, X } from "lucide-react";

import type { Event, Project } from "@/db/schema";
import {
  eventToCalendarItem,
  type CalendarItem,
  type NoteOption,
  type TaskOption,
} from "@/components/calendar/eventTypes";
import PageQuickActions from "@/components/shared/quick-actions/PageQuickActions";
import type {
  QuickTag,
  QuickReference,
  QuickNote,
} from "@/lib/types/quickTypes";
import EditEventPopup from "@/components/calendar/EditEventPopup";

type EventDetailsPanelProps = {
  variant?: "modal" | "page";
  event: Event;
  userId: string;
  projects: Project[];
  tags: QuickTag[];
  references: QuickReference[];
  notes: QuickNote[];
  calendarNotes?: NoteOption[];
  tasks?: TaskOption[];
  items?: CalendarItem[];
  attachedTagIds?: string[];
  linkedNoteIds?: string[];
  linkedReferenceIds?: string[];
  linkedProjectIds?: string[];
  onClose?: () => void;
};

export default function EventDetailsPanel({
  variant = "modal",
  event,
  userId,
  projects,
  tags,
  references,
  notes,
  attachedTagIds = [],
  linkedNoteIds = [],
  linkedReferenceIds = [],
  linkedProjectIds = [],
  items = [],
  calendarNotes = [],
  tasks = [],
  onClose,
}: EventDetailsPanelProps) {
  const router = useRouter();

  const [selectedItem, setSelectedItem] = useState<
    | { type: "tag"; item: QuickTag }
    | { type: "note"; item: QuickNote }
    | { type: "reference"; item: QuickReference }
    | null
  >(null);

  const [copiedCitation, setCopiedCitation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [currentAttachedTagIds, setCurrentAttachedTagIds] =
    useState(attachedTagIds);
  const [currentLinkedNoteIds, setCurrentLinkedNoteIds] =
    useState(linkedNoteIds);
  const [currentLinkedReferenceIds, setCurrentLinkedReferenceIds] =
    useState(linkedReferenceIds);
  const [currentLinkedProjectIds, setCurrentLinkedProjectIds] =
    useState(linkedProjectIds);

  const attachedTags = tags.filter((tag) =>
    currentAttachedTagIds.includes(tag.id),
  );
  const linkedNotes = notes.filter((note) =>
    currentLinkedNoteIds.includes(note.id),
  );
  const linkedReferences = references.filter((reference) =>
    currentLinkedReferenceIds.includes(reference.id),
  );
  const linkedProjects = projects.filter((project) =>
    currentLinkedProjectIds.includes(project.id),
  );

  function getApaReference(reference: QuickReference) {
    return (
      reference.citation ??
      [
        reference.author,
        reference.publishedDate ? `(${reference.publishedDate}).` : "(n.d.).",
        reference.title,
        reference.publisher,
        reference.url,
      ]
        .filter(Boolean)
        .join(" ")
    );
  }

  const content = (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <PageQuickActions
        entityType="event"
        entityId={event.id}
        sourceTitle={event.title}
        sourceContent={event.description ?? ""}
        userId={userId}
        tags={tags}
        references={references}
        notes={notes}
        projects={projects}
        attachedTagIds={currentAttachedTagIds}
        linkedNoteIds={currentLinkedNoteIds}
        linkedReferenceIds={currentLinkedReferenceIds}
        linkedProjectIds={currentLinkedProjectIds}
        onAttachedTagIdsChange={setCurrentAttachedTagIds}
        onLinkedNoteIdsChange={setCurrentLinkedNoteIds}
        onLinkedReferenceIdsChange={setCurrentLinkedReferenceIds}
        onLinkedProjectIdsChange={setCurrentLinkedProjectIds}
        tagSuggestionText={`${event.title} ${event.description ?? ""}`}
      />

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 text-[rgb(var(--text))] shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              Event
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[rgb(var(--text))]">
              {event.title}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit event"
              aria-label="Edit event"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--muted))] shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-200"
            >
              <Pencil size={16} />
            </button>

            {variant === "modal" && onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close"
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--bg))] hover:text-[rgb(var(--text))]"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {event.description ? (
          <p className="whitespace-pre-wrap text-sm text-[rgb(var(--text))]">
            {event.description}
          </p>
        ) : (
          <p className="text-sm text-[rgb(var(--muted))]">
            No description yet.
          </p>
        )}

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-4">
          <InfoBox
            label="Status"
            value={event.status?.replace("_", " ") ?? ""}
          />
          <InfoBox label="Start" value={String(event.startDate)} />
          <InfoBox
            label="End"
            value={event.endDate ? String(event.endDate) : "No end date"}
          />
          <InfoBox label="Location" value={event.location ?? "No location"} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <LinkedSection title="Tags">
            {attachedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {attachedTags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => setSelectedItem({ type: "tag", item: tag })}
                    className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            ) : (
              <EmptyText>No tags attached.</EmptyText>
            )}
          </LinkedSection>

          <LinkedSection title="Linked notes">
            {linkedNotes.length > 0 ? (
              <LinkedButtonList
                items={linkedNotes}
                onSelect={(note) =>
                  setSelectedItem({ type: "note", item: note })
                }
              />
            ) : (
              <EmptyText>No linked notes.</EmptyText>
            )}
          </LinkedSection>

          <LinkedSection title="Linked references">
            {linkedReferences.length > 0 ? (
              <LinkedButtonList
                items={linkedReferences}
                onSelect={(reference) =>
                  setSelectedItem({ type: "reference", item: reference })
                }
              />
            ) : (
              <EmptyText>No linked references.</EmptyText>
            )}
          </LinkedSection>

          <LinkedSection title="Linked projects">
            {linkedProjects.length > 0 ? (
              <div className="space-y-2">
                {linkedProjects.map((project) => (
                  <a
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-left text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--bg))]"
                  >
                    {project.title}
                  </a>
                ))}
              </div>
            ) : (
              <EmptyText>No linked projects.</EmptyText>
            )}
          </LinkedSection>
        </div>
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 text-[rgb(var(--text))] shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                  {selectedItem.type}
                </p>

                <h3 className="mt-1 text-lg font-bold text-[rgb(var(--text))]">
                  {selectedItem.type === "tag"
                    ? `#${selectedItem.item.name}`
                    : selectedItem.item.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-full p-2 text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--bg))]"
              >
                <X size={18} />
              </button>
            </div>

            {selectedItem.type === "tag" && (
              <div className="space-y-3">
                <div className="rounded-xl bg-[rgb(var(--bg))] p-3 text-sm">
                  <p className="font-semibold text-[rgb(var(--text))]">
                    Cards with this tag: {selectedItem.item.noteCount ?? 0}{" "}
                    notes.
                  </p>
                </div>

                <a
                  href={`/notes?tag=${selectedItem.item.id}`}
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] px-3 py-2 text-sm font-semibold hover:bg-[rgb(var(--bg))]"
                >
                  View notes with this tag
                  <ExternalLink size={15} />
                </a>
              </div>
            )}

            {selectedItem.type === "note" && (
              <div className="space-y-3">
                <div className="rounded-xl bg-[rgb(var(--bg))] p-3">
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">
                    {selectedItem.item.title}
                  </p>

                  <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-[rgb(var(--muted))]">
                    {selectedItem.item.content ?? "No note content available."}
                  </p>
                </div>

                <a
                  href={`/notes/${selectedItem.item.id}`}
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] px-3 py-2 text-sm font-semibold hover:bg-[rgb(var(--bg))]"
                >
                  Go to note
                  <ExternalLink size={15} />
                </a>
              </div>
            )}

            {selectedItem.type === "reference" && (
              <div className="space-y-3">
                <div className="rounded-xl bg-[rgb(var(--bg))] p-3">
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">
                    APA reference
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-[rgb(var(--muted))]">
                    {getApaReference(selectedItem.item)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      getApaReference(selectedItem.item),
                    );
                    setCopiedCitation(true);
                    setTimeout(() => setCopiedCitation(false), 2000);
                  }}
                  className="w-full rounded-xl border border-[rgb(var(--border))] px-3 py-2 text-sm font-semibold hover:bg-[rgb(var(--bg))]"
                >
                  <span className="flex items-center justify-center gap-2">
                    {copiedCitation ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        Copied
                      </>
                    ) : (
                      "Copy citation"
                    )}
                  </span>
                </button>

                <a
                  href={`/references/${selectedItem.item.id}?from=${encodeURIComponent(
                    "/calendar",
                  )}`}
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] px-3 py-2 text-sm font-semibold hover:bg-[rgb(var(--bg))]"
                >
                  Go to reference
                  <ExternalLink size={15} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <EditEventPopup
          event={eventToCalendarItem(event)}
          items={items}
          notes={calendarNotes}
          tasks={tasks}
          onClose={() => {
            setIsEditing(false);

            if (variant === "page") {
              router.refresh();
            }
          }}
        />
      )}
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 p-4">
        <div className="mx-auto max-h-[90vh] max-w-6xl overflow-y-auto rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
      <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
        {label}
      </p>
      <p className="mt-1 font-medium capitalize text-[rgb(var(--text))]">
        {value}
      </p>
    </div>
  );
}

function LinkedSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
        {title}
      </p>
      {children}
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[rgb(var(--muted))]">{children}</p>;
}

function LinkedButtonList<T extends { id: string; title: string | null }>({
  items,
  onSelect,
}: {
  items: T[];
  onSelect: (item: T) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onSelect(item)}
          className="block w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-left text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--bg))]"
        >
          {item.title ?? "Untitled"}
        </button>
      ))}
    </div>
  );
}
