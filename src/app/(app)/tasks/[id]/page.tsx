import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentUserId } from "@/db/queries/users";
import {
  getTaskById,
  getTagIdsForTask,
  getLinkedNoteIdsForTask,
  getLinkedReferenceIdsForTask,
  getLinkedProjectIdsForTask,
} from "@/db/queries/tasks";
import { getUserProjects } from "@/db/queries/projects";
import { getTagsForUser } from "@/db/queries/tags";
import { getReferencesForUser } from "@/db/queries/references";
import { getNotesForUser } from "@/db/queries/notes";
import TaskDetailsPageClient from "@/components/tasks/TaskDetailsPageClient";

type TaskDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaskDetailsPage({
  params,
}: TaskDetailsPageProps) {
  const userId = await getCurrentUserId();

  const { id } = await params;

  const [
    task,
    projects,
    tags,
    references,
    notes,
    attachedTagIds,
    linkedNoteIds,
    linkedReferenceIds,
    linkedProjectIds,
  ] = await Promise.all([
    getTaskById(id, userId),
    getUserProjects(userId),
    getTagsForUser(userId),
    getReferencesForUser(userId),
    getNotesForUser(userId),
    getTagIdsForTask(userId, id),
    getLinkedNoteIdsForTask(userId, id),
    getLinkedReferenceIdsForTask(userId, id),
    getLinkedProjectIdsForTask(userId, id),
  ]);

  if (!task) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-4 py-6 text-[rgb(var(--text))]">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/tasks"
          className="
            mb-4 inline-flex items-center gap-2 rounded-full
            border border-[rgb(var(--border))]
            bg-[rgb(var(--card))]
            px-3 py-1.5 text-sm font-medium
            text-[rgb(var(--muted))]
            transition hover:text-[rgb(var(--text))]
          "
        >
          <ArrowLeft size={16} />
          Back to tasks
        </Link>

        <TaskDetailsPageClient
          task={task}
          userId={userId}
          projects={projects}
          tags={tags}
          references={references}
          notes={notes}
          attachedTagIds={attachedTagIds}
          linkedNoteIds={linkedNoteIds}
          linkedReferenceIds={linkedReferenceIds}
          linkedProjectIds={linkedProjectIds}
        />
      </div>
    </main>
  );
}
