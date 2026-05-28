// app/notes/[id]/page.tsx

import NoteCard from "@/components/notes/card/NoteCard";
import PageQuickActions from "@/components/shared/quick-actions/PageQuickActions";
import { getNoteDetailsById, getNotesForUser } from "@/db/queries/notes";
import { getReferencesForUser } from "@/db/queries/references";
import { getTagsForUser } from "@/db/queries/tags";
import { getUserProjectsAction } from "@/app/actions/projects";
import Link from "next/link";
import { getTasksByUserId } from "@/db/queries/tasks";
import { getEventsByUserId } from "@/db/queries/calendar";
import { notFound } from "next/navigation";

type NoteDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

export default async function NoteDetailsPage({
  params,
}: NoteDetailsPageProps) {
  const { id } = await params;

  const data = await getNoteDetailsById(id);

  if (!data) {
    notFound();
  }
  const projects = await getUserProjectsAction();
  const userId = data.note.createdByUserId;

  const notes = await getNotesForUser(userId);
  const userTags = await getTagsForUser(userId);
  const userReferences = await getReferencesForUser(userId);
  const userTasks = await getTasksByUserId(userId);
  const userEvents = await getEventsByUserId(userId);

  const taskOptions = userTasks.map((task) => ({
    id: task.id,
    title: task.title,
  }));

  const eventOptions = userEvents.map((event) => ({
    id: event.id,
    title: event.title,
  }));

  const noteOptions = notes.map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content ?? "",
  }));

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
      <div className="mx-auto mb-6 max-w-6xl">
        <Link
          href="/notes"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to notes
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[clamp(260px,22vw,360px)_minmax(0,1fr)]">
        <PageQuickActions
          entityType="note"
          entityId={data.note.id}
          sourceTitle={data.note.title}
          sourceContent={data.note.content ?? ""}
          userId={userId}
          tags={userTags}
          references={userReferences}
          notes={noteOptions}
          projects={projects}
          tasks={taskOptions}
          events={eventOptions}
          linkedTaskIds={uniqueIds([
            ...data.outgoingLinks
              .filter((link) => link.targetType === "task")
              .map((link) => link.targetId),
            ...data.backlinks
              .filter((link) => link.sourceType === "task")
              .map((link) => link.sourceId),
          ])}
          linkedEventIds={uniqueIds([
            ...data.outgoingLinks
              .filter((link) => link.targetType === "event")
              .map((link) => link.targetId),
            ...data.backlinks
              .filter((link) => link.sourceType === "event")
              .map((link) => link.sourceId),
          ])}
          attachedTagIds={data.tags.map((tag) => tag.id)}
          inlineTagIds={[]}
          linkedNoteIds={uniqueIds([
            ...data.outgoingLinks
              .filter((link) => link.targetType === "note")
              .map((link) => link.targetId),
            ...data.backlinks
              .filter((link) => link.sourceType === "note")
              .map((link) => link.sourceId),
          ])}
          linkedReferenceIds={uniqueIds(
            data.references.map((reference) => reference.id),
          )}
          tagSuggestionText={`${data.note.title} ${data.note.content ?? ""}`}
        />

        <NoteCard
          data={data}
          userId={userId}
          allNotes={noteOptions}
          userTags={userTags}
          userReferences={userReferences}
        />
      </div>
    </main>
  );
}
