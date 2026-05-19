// src/components/tasks/TaskDetailsModal.tsx

"use client";

import { X, ExternalLink, Check } from "lucide-react";
import type { Project, Task } from "@/db/schema";
import PageQuickActions from "@/components/shared/PageQuickActions";
import type { EditTaskInput } from "@/components/tasks/TaskCard";
import { QuickTag, QuickReference, QuickNote } from "@/lib/types/quickTypes";
import { useState } from "react";

type TaskDetailsModalProps = {
  task: Task;
  userId: string;
  projects: Project[];
  tags: QuickTag[];
  references: QuickReference[];
  notes: QuickNote[];
  attachedTagIds?: string[];
  linkedNoteIds?: string[];
  linkedReferenceIds?: string[];
  onClose: () => void;
  onEditTask: (taskId: string, data: EditTaskInput) => Promise<void>;
};

export default function TaskDetailsModal({
  task,
  userId,
  projects,
  tags,
  references,
  notes,
  onClose,
  attachedTagIds = [],
  linkedNoteIds = [],
  linkedReferenceIds = [],
}: TaskDetailsModalProps) {
  const [selectedItem, setSelectedItem] = useState<
    | { type: "tag"; item: QuickTag }
    | { type: "note"; item: QuickNote }
    | { type: "reference"; item: QuickReference }
    | null
  >(null);
  const [copiedCitation, setCopiedCitation] = useState(false);

  const [currentAttachedTagIds, setCurrentAttachedTagIds] =
    useState(attachedTagIds);

  const [currentLinkedNoteIds, setCurrentLinkedNoteIds] =
    useState(linkedNoteIds);

  const [currentLinkedReferenceIds, setCurrentLinkedReferenceIds] =
    useState(linkedReferenceIds);
  const attachedTags = tags.filter((tag) =>
    currentAttachedTagIds.includes(tag.id),
  );

  const linkedNotes = notes.filter((note) =>
    currentLinkedNoteIds.includes(note.id),
  );

  const linkedReferences = references.filter((reference) =>
    currentLinkedReferenceIds.includes(reference.id),
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
  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4">
      <div className="mx-auto grid max-h-[90vh] max-w-6xl gap-6 overflow-y-auto rounded-2xl bg-gray-50 p-4 shadow-xl dark:bg-gray-950 lg:grid-cols-[260px_1fr]">
        <PageQuickActions
          entityType="task"
          entityId={task.id}
          userId={userId}
          tags={tags}
          references={references}
          notes={notes}
          projects={projects}
          attachedTagIds={currentAttachedTagIds}
          linkedNoteIds={currentLinkedNoteIds}
          linkedReferenceIds={currentLinkedReferenceIds}
          onAttachedTagIdsChange={setCurrentAttachedTagIds}
          onLinkedNoteIdsChange={setCurrentLinkedNoteIds}
          onLinkedReferenceIdsChange={setCurrentLinkedReferenceIds}
          tagSuggestionText={`${task.title} ${task.description ?? ""}`}
        />

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Task
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {task.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <X size={18} />
            </button>
          </div>

          {task.description ? (
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {task.description}
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No description yet.
            </p>
          )}

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Status
              </p>
              <p className="mt-1 font-medium capitalize text-gray-900 dark:text-gray-100">
                {task.status.replace("_", " ")}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Priority
              </p>
              <p className="mt-1 font-medium capitalize text-gray-900 dark:text-gray-100">
                {task.priority ?? "medium"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Due
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                {task.dueDate ?? "No due date"}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tags
              </p>

              {attachedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {attachedTags.map((tag) => (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() =>
                        setSelectedItem({
                          type: "tag",
                          item: tag,
                        })
                      }
                      title={`View items tagged #${tag.name}`}
                      className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-400 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tags attached.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Linked notes
              </p>

              {linkedNotes.length > 0 ? (
                <div className="space-y-2">
                  {linkedNotes.map((note) => (
                    <button
                      type="button"
                      key={note.id}
                      onClick={() =>
                        setSelectedItem({
                          type: "note",
                          item: note,
                        })
                      }
                      title="Open note options"
                      className="block w-full rounded-lg bg-gray-100 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {note.title}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No linked notes.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Linked references
              </p>

              {linkedReferences.length > 0 ? (
                <div className="space-y-2">
                  {linkedReferences.map((reference) => (
                    <button
                      type="button"
                      key={reference.id}
                      onClick={() =>
                        setSelectedItem({
                          type: "reference",
                          item: reference,
                        })
                      }
                      title="Open reference options"
                      className="block w-full rounded-lg bg-gray-100 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {reference.title}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No linked references.
                </p>
              )}
            </div>
          </div>
        </section>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {selectedItem.type}
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                    {selectedItem.type === "tag"
                      ? `#${selectedItem.item.name}`
                      : selectedItem.item.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedItem.type === "tag" && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-gray-100 p-3 text-sm dark:bg-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Cards with this tag:
                      {selectedItem.item.noteCount ?? 0} notes.
                    </p>
                  </div>

                  <a
                    href={`/notes?tag=${selectedItem.item.id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    View notes with this tag
                    <ExternalLink size={15} />
                  </a>
                </div>
              )}

              {selectedItem.type === "note" && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {selectedItem.item.title}
                    </p>

                    <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                      {selectedItem.item.content ??
                        "No note content available."}
                    </p>
                  </div>

                  <a
                    href={`/notes/${selectedItem.item.id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    Go to note
                    <ExternalLink size={15} />
                  </a>
                </div>
              )}

              {selectedItem.type === "reference" && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      APA reference
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
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

                      setTimeout(() => {
                        setCopiedCitation(false);
                      }, 2000);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
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
                    href={`/references/${selectedItem.item.id}?from=${encodeURIComponent("/tasks")}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    Go to reference
                    <ExternalLink size={15} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
