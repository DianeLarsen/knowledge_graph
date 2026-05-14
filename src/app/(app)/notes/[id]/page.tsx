// app/notes/[id]/page.tsx

import NoteCard from "@/components/notes/NoteCard";
import PageQuickActions from "@/components/shared/PageQuickActions";
import { getNoteDetailsById, getNotesForUser } from "@/db/queries/notes";
import { getReferencesForUser } from "@/db/queries/references";
import { getTagsForUser } from "@/db/queries/tags";
import { getUserProjectsAction } from "@/app/actions/projects";
import Link from "next/link";

type NoteDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NoteDetailsPage({
  params,
}: NoteDetailsPageProps) {
  const { id } = await params;

  const data = await getNoteDetailsById(id);



  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-300">Note not found.</p>
        </div>
      </main>
    );
  }
  const projects = await getUserProjectsAction();
  const userId = data.note.createdByUserId;

  const notes = await getNotesForUser(userId);
  const userTags = await getTagsForUser(userId);
  const userReferences = await getReferencesForUser(userId);

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

      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[240px_1fr]">
        <PageQuickActions
          entityType="note"
          entityId={data.note.id}
          userId={userId}
          tags={userTags}
          references={userReferences}
          notes={noteOptions}
          projects={projects}
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
