// app/notes/[id]/page.tsx

import NoteCard from "@/components/notes/NoteCard";
import { getNoteDetailsById } from "@/db/queries/notes";
import Link from "next/link";
import { getNotesForUser } from "@/db/queries/notes";
import { getReferences, getReferencesForUser } from "@/db/queries/references";
import { getAllTags, getTagsForUser } from "@/db/queries/tags";


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
const notes = await getNotesForUser(data.note.userId);
const allReferences = await getReferences();
const allTags = await getAllTags();
  const userTags = await getTagsForUser(data.note.userId);
  const userReferences = await getReferencesForUser(data.note.userId);
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between">
        <Link
          href="/notes"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to notes
        </Link>
      </div>

      <NoteCard
        data={data}
        userId={data.note.userId}
        allNotes={notes.map((note) => ({
          id: note.id,
          title: note.title,
        }))}
        allTags={allTags}
        allReferences={allReferences}
        userTags={userTags}
        userReferences={userReferences}
      />
    </main>
  );
}
