// src/components/tasks/TaskDetailsPanel.tsx

"use client";

import { X, ExternalLink, Check, Pencil } from "lucide-react";
import type { Project, Task } from "@/db/schema";
import PageQuickActions from "@/components/shared/quick-actions/PageQuickActions";
import type { EditTaskInput } from "@/components/tasks/TaskCard";
import { QuickTag, QuickReference, QuickNote } from "@/lib/types/quickTypes";
import { useState } from "react";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import { updateTaskAction } from "@/app/actions/tasks";
import { useRouter } from "next/navigation";

type TaskDetailsPanelProps = {
  variant?: "modal" | "page";
  task: Task;
  userId: string;
  projects: Project[];
  tags: QuickTag[];
  references: QuickReference[];
  notes: QuickNote[];
  attachedTagIds?: string[];
  linkedNoteIds?: string[];
  linkedReferenceIds?: string[];
  linkedProjectIds?: string[];
  onClose?: () => void;
};

export default function TaskDetailsPanel({
  task,
  userId,
  projects,
  tags,
  references,
  notes,
  attachedTagIds = [],
  linkedNoteIds = [],
  linkedReferenceIds = [],
  linkedProjectIds = [],
  variant = "modal",
  onClose,
}: TaskDetailsPanelProps) {
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
  const [currentLinkedProjectIds, setCurrentLinkedProjectIds] =
    useState(linkedProjectIds);

  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const linkedProjects = projects.filter((project) =>
    currentLinkedProjectIds.includes(project.id),
  );
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
  async function handleSave(data: EditTaskInput) {
    await updateTaskAction(task.id, data);
    setIsEditing(false);
    if (variant === "page") {
      router.refresh();
    }
  }

  const content = (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <PageQuickActions
        entityType="task"
        entityId={task.id}
        sourceTitle={task.title}
        sourceContent={task.description ?? ""}
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
        linkedProjectIds={currentLinkedProjectIds}
        onLinkedProjectIdsChange={setCurrentLinkedProjectIds}
        onLinkedReferenceIdsChange={setCurrentLinkedReferenceIds}
        tagSuggestionText={`${task.title} ${task.description ?? ""}`}
      />

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 text-[rgb(var(--text))] shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              Task
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[rgb(var(--text))]">
              {task.title}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit task"
              aria-label="Edit task"
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

        {task.description ? (
          <p className="whitespace-pre-wrap text-sm text-[rgb(var(--text))]">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-[rgb(var(--muted))]">
            No description yet.
          </p>
        )}

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="text-[rgb(var(--muted))]">
            <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
              Status
            </p>
            <p className="mt-1 font-medium capitalize text-[rgb(var(--text))]">
              {task.status.replace("_", " ")}
            </p>
          </div>

          <div className="text-[rgb(var(--muted))]">
            <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
              Priority
            </p>
            <p className="mt-1 font-medium capitalize text-[rgb(var(--text))]">
              {task.priority ?? "medium"}
            </p>
          </div>

          <div className="text-[rgb(var(--muted))]">
            <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
              Due
            </p>
            <p className="mt-1 font-medium text-[rgb(var(--text))]">
              {task.dueDate ?? "No due date"}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
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
                    className="block w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-left text-sm font-medium text-[rgb(var(--text))] transition hover:bg-[rgb(var(--bg))]"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[rgb(var(--muted))]">
                No tags attached.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
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
                    className="block w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-left text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--bg))]"
                  >
                    {note.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[rgb(var(--muted))]">
                No linked notes.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
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
                    className="block w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-left text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--bg))]"
                  >
                    {reference.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[rgb(var(--muted))]">
                No linked references.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              Linked projects
            </p>

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
              <p className="text-sm text-[rgb(var(--muted))]">
                No linked projects.
              </p>
            )}
          </div>
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
                className="rounded-full p-2 text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))]"
              >
                <X size={18} />
              </button>
            </div>

            {selectedItem.type === "tag" && (
              <div className="space-y-3">
                <div className="rounded-xl bg-[rgb(var(--bg))] p-3 text-sm ">
                  <p className="font-semibold text-[rgb(var(--text))]">
                    Cards with this tag:
                    {selectedItem.item.noteCount ?? 0} notes.
                  </p>
                </div>

                <a
                  href={`/notes?tag=${selectedItem.item.id}`}
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold "
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
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold "
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

                    setTimeout(() => {
                      setCopiedCitation(false);
                    }, 2000);
                  }}
                  className="w-full rounded-xl border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold "
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
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold "
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
        <EditTaskModal
          task={task}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
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
