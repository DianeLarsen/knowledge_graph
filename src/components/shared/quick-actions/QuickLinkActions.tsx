"use client";

import { useState } from "react";
import type { EntityType, RelationshipType } from "@/db/schema";
import type {
  QuickReference,
  QuickNote,
  QuickTask,
  QuickEvent,
} from "@/lib/types/quickTypes";
import { createEntityLinkAction } from "@/app/actions/entityLinks";
import { getRelationshipLabel } from "@/lib/entityRelationships";
import { CalendarDays, CheckSquare, FileText, Library } from "lucide-react";
import type { QuickLinkSuggestion } from "@/lib/types/quickSuggestions";
import QuickSuggestionChips from "@/components/shared/quick-actions/QuickSuggestionChips";

export type LinkTargetType = "note" | "reference" | "task" | "event";

type QuickLinkActionsProps = {
  entityType: EntityType;
  entityId: string;
  notes: QuickNote[];
  references: QuickReference[];
  linkedNoteIds: string[];
  linkedReferenceIds: string[];
  tasks: QuickTask[];
  events: QuickEvent[];
  linkedTaskIds: string[];
  linkedEventIds: string[];
  onLinkedTaskIdsChange?: (taskIds: string[]) => void;
  onLinkedEventIdsChange?: (eventIds: string[]) => void;
  onLinkedNoteIdsChange?: (noteIds: string[]) => void;
  onLinkedReferenceIdsChange?: (referenceIds: string[]) => void;
  linkSuggestions?: QuickLinkSuggestion[];
  onSuggest?: () => void;
  isSuggesting?: boolean;
};

function sortByTitle<T extends { title: string }>(items: T[]) {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

function LinkTargetIcon({ type }: { type: LinkTargetType }) {
  const className = "h-4 w-4 shrink-0";

  if (type === "note") return <FileText className={className} />;
  if (type === "task") return <CheckSquare className={className} />;
  if (type === "event") return <CalendarDays className={className} />;
  return <Library className={className} />;
}

export default function QuickLinkActions({
  entityType,
  entityId,
  notes,
  references,
  linkedNoteIds,
  linkedReferenceIds,
  tasks = [],
  events = [],
  linkedTaskIds = [],
  linkedEventIds = [],
  onLinkedTaskIdsChange,
  onLinkedEventIdsChange,
  onLinkedNoteIdsChange,
  onLinkedReferenceIdsChange,
  linkSuggestions = [],
  onSuggest,
  isSuggesting = false,
}: QuickLinkActionsProps) {
  const [activePicker, setActivePicker] = useState<LinkTargetType | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>("related");
  const [pickerSearch, setPickerSearch] = useState("");

  const availableTasks = sortByTitle(
    tasks.filter((task) => {
      if (entityType === "task" && task.id === entityId) return false;
      return !linkedTaskIds.includes(task.id);
    }),
  );

  const linkedTasks = tasks.filter((task) => linkedTaskIds.includes(task.id));

  const availableEvents = sortByTitle(
    events.filter((event) => {
      if (entityType === "event" && event.id === entityId) return false;
      return !linkedEventIds.includes(event.id);
    }),
  );

  const linkedEvents = events.filter((event) =>
    linkedEventIds.includes(event.id),
  );

  const availableNotes = sortByTitle(
    notes.filter((note) => {
      if (entityType === "note" && note.id === entityId) return false;
      return !linkedNoteIds.includes(note.id);
    }),
  );

  const linkedNotes = notes.filter((note) => linkedNoteIds.includes(note.id));

  const availableReferences = sortByTitle(
    references.filter((reference) => {
      if (entityType === "reference" && reference.id === entityId) return false;
      return !linkedReferenceIds.includes(reference.id);
    }),
  );

  const linkedReferences = references.filter((reference) =>
    linkedReferenceIds.includes(reference.id),
  );

  const pickerConfig = {
    note: {
      title: "Link note",
      label: "Choose note...",
      items: availableNotes,
      defaultRelationship: "related",
      relationships: [
        "related",
        "supports",
        "references",
        "follow_up",
        "depends_on",
        "extends",
      ],
    },
    reference: {
      title: "Link reference",
      label: "Choose reference...",
      items: availableReferences,
      defaultRelationship: "references",
      relationships: ["references", "uses", "supports", "related"],
    },
    task: {
      title: "Link task",
      label: "Choose task...",
      items: availableTasks,
      defaultRelationship: "related",
      relationships: [
        "related",
        "supports",
        "blocks",
        "follow_up",
        "depends_on",
      ],
    },
    event: {
      title: "Link event",
      label: "Choose event...",
      items: availableEvents,
      defaultRelationship: "related",
      relationships: ["related", "supports", "follow_up", "depends_on"],
    },
  } satisfies Record<
    LinkTargetType,
    {
      title: string;
      label: string;
      items: { id: string; title: string }[];
      defaultRelationship: RelationshipType;
      relationships: RelationshipType[];
    }
  >;

  const activePickerItems = activePicker
    ? pickerConfig[activePicker].items.filter((item) =>
        item.title.toLowerCase().includes(pickerSearch.trim().toLowerCase()),
      )
    : [];

  function openPicker(type: LinkTargetType) {
    setActivePicker(type);
    setSelectedTargetId("");
    setPickerSearch("");
    setRelationshipType(pickerConfig[type].defaultRelationship);
  }

  async function handleLinkTarget(formData: FormData) {
    await createEntityLinkAction(formData);

    if (!activePicker || !selectedTargetId) return;

    if (activePicker === "note") {
      onLinkedNoteIdsChange?.(
        linkedNoteIds.includes(selectedTargetId)
          ? linkedNoteIds
          : [...linkedNoteIds, selectedTargetId],
      );
    }

    if (activePicker === "reference") {
      onLinkedReferenceIdsChange?.(
        linkedReferenceIds.includes(selectedTargetId)
          ? linkedReferenceIds
          : [...linkedReferenceIds, selectedTargetId],
      );
    }

    if (activePicker === "task") {
      onLinkedTaskIdsChange?.(
        linkedTaskIds.includes(selectedTargetId)
          ? linkedTaskIds
          : [...linkedTaskIds, selectedTargetId],
      );
    }

    if (activePicker === "event") {
      onLinkedEventIdsChange?.(
        linkedEventIds.includes(selectedTargetId)
          ? linkedEventIds
          : [...linkedEventIds, selectedTargetId],
      );
    }

    setActivePicker(null);
    setSelectedTargetId("");
  }

  const selectClass =
    "w-full rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[rgb(var(--text))] shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:bg-slate-950 dark:focus:ring-purple-900";

  const linkButtonClass =
    "flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600";

  const linkedItemClass =
    "rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-900 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200";

  const groupLabelClass =
    "mb-1 text-xs font-bold uppercase tracking-wide text-[rgb(var(--muted))]";

  const pickerItemClass =
    "flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition";

  const selectedPickerItemClass =
    "border-purple-400 bg-purple-100 text-purple-900 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-100";

  const unselectedPickerItemClass =
    "border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-slate-100 dark:hover:bg-slate-900";

  return (
    <div className="space-y-3">
      {onSuggest && (
        <button
          type="button"
          onClick={onSuggest}
          disabled={isSuggesting}
          className="w-full rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          {isSuggesting ? "Thinking..." : "Suggest links"}
        </button>
      )}
      <QuickSuggestionChips
        title="Suggested links"
        suggestions={linkSuggestions.filter((suggestion) => {
          if (suggestion.type === "note")
            return !linkedNoteIds.includes(suggestion.id);
          if (suggestion.type === "reference")
            return !linkedReferenceIds.includes(suggestion.id);
          if (suggestion.type === "task")
            return !linkedTaskIds.includes(suggestion.id);
          if (suggestion.type === "event")
            return !linkedEventIds.includes(suggestion.id);
          return false;
        })}
        getKey={(suggestion) => `${suggestion.type}-${suggestion.id}`}
        getLabel={(suggestion) => `${suggestion.type}: ${suggestion.title}`}
        getDescription={(suggestion) => suggestion.reason}
        onSelect={(suggestion) => {
          openPicker(suggestion.type);
          setSelectedTargetId(suggestion.id);
        }}
      />
      {linkedNotes.length > 0 && (
        <div className="mb-3">
          <p className={groupLabelClass}>Linked notes</p>

          <div className="space-y-1">
            {linkedNotes.map((note) => (
              <p
                key={note.id}
                className={`${linkedItemClass} flex items-center gap-2`}
              >
                <LinkTargetIcon type="note" />
                {note.title}
              </p>
            ))}
          </div>
        </div>
      )}

      {linkedTasks.length > 0 && (
        <div className="mb-3">
          <p className={groupLabelClass}>Linked tasks</p>

          <div className="space-y-1">
            {linkedTasks.map((task) => (
              <p
                key={task.id}
                className={`${linkedItemClass} flex items-center gap-2`}
              >
                <LinkTargetIcon type="task" />
                {task.title}
              </p>
            ))}
          </div>
        </div>
      )}

      {linkedEvents.length > 0 && (
        <div className="mb-3">
          <p className={groupLabelClass}>Linked events</p>

          <div className="space-y-1">
            {linkedEvents.map((event) => (
              <p
                key={event.id}
                className={`${linkedItemClass} flex items-center gap-2`}
              >
                <LinkTargetIcon type="event" />
                {event.title}
              </p>
            ))}
          </div>
        </div>
      )}

      {linkedReferences.length > 0 && (
        <div className="mb-3">
          <p className={groupLabelClass}>Linked references</p>

          <div className="space-y-1">
            {linkedReferences.map((reference) => (
              <p
                key={reference.id}
                className={`${linkedItemClass} flex items-center gap-2`}
              >
                <LinkTargetIcon type="reference" />
                {reference.title}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="grid gap-2 grid-cols-4 md:grid-cols-4 lg:grid-cols-1 xl:grid-cols-2">
          {availableNotes.length > 0 && (
            <button
              type="button"
              onClick={() => openPicker("note")}
              className={linkButtonClass}
            >
              <LinkTargetIcon type="note" />
              Link note
            </button>
          )}

          {availableReferences.length > 0 && (
            <button
              type="button"
              onClick={() => openPicker("reference")}
              className={linkButtonClass}
            >
              <LinkTargetIcon type="reference" />
              Link reference
            </button>
          )}

          {availableTasks.length > 0 && (
            <button
              type="button"
              onClick={() => openPicker("task")}
              className={linkButtonClass}
            >
              <LinkTargetIcon type="task" />
              Link task
            </button>
          )}

          {availableEvents.length > 0 && (
            <button
              type="button"
              onClick={() => openPicker("event")}
              className={linkButtonClass}
            >
              <LinkTargetIcon type="event" />
              Link event
            </button>
          )}
        </div>

        {availableNotes.length === 0 &&
          availableReferences.length === 0 &&
          availableTasks.length === 0 &&
          availableEvents.length === 0 && (
            <p className="text-xs text-[rgb(var(--muted))]">
              Everything available is already linked.
            </p>
          )}
      </div>
      {activePicker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="relative z-[10000] w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[rgb(var(--text))]">
                  {pickerConfig[activePicker].title}
                </h3>
                <p className="text-xs text-[rgb(var(--muted))]">
                  Choose an item and relationship.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="rounded-lg px-2 py-1 text-md font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                ×
              </button>
            </div>

            <form action={handleLinkTarget} className="space-y-3">
              <input type="hidden" name="sourceType" value={entityType} />
              <input type="hidden" name="sourceId" value={entityId} />
              <input type="hidden" name="targetType" value={activePicker} />
              <input type="hidden" name="targetId" value={selectedTargetId} />

              <div className="space-y-2">
                <input
                  type="search"
                  value={pickerSearch}
                  onChange={(event) => setPickerSearch(event.target.value)}
                  placeholder={`Search ${activePicker}s...`}
                  className={selectClass}
                />

                <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-2">
                  {activePickerItems.length > 0 ? (
                    activePickerItems.map((item) => {
                      const selected = selectedTargetId === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedTargetId(item.id)}
                          className={`${pickerItemClass} ${
                            selected
                              ? selectedPickerItemClass
                              : unselectedPickerItemClass
                          }`}
                        >
                          <span className="mt-0.5 text-purple-600 dark:text-purple-300">
                            <LinkTargetIcon type={activePicker} />
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate font-semibold">
                              {item.title}
                            </span>

                            <span className="block text-xs opacity-70">
                              {activePicker}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-2 py-3 text-xs text-[rgb(var(--muted))]">
                      No matching {activePicker}s found.
                    </p>
                  )}
                </div>
              </div>

              <select
                name="relationshipType"
                value={relationshipType}
                onChange={(event) =>
                  setRelationshipType(event.target.value as RelationshipType)
                }
                className={selectClass}
              >
                {pickerConfig[activePicker].relationships.map(
                  (relationship) => (
                    <option key={relationship} value={relationship}>
                      {getRelationshipLabel(relationship)}
                    </option>
                  ),
                )}
              </select>

              <button
                type="submit"
                disabled={!selectedTargetId}
                className={`${linkButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {pickerConfig[activePicker].title}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
