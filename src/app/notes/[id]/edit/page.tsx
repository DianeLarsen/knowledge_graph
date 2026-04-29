import EditNoteForm from "@/components/EditNoteForm";
import { getNoteDetailsById } from "@/db/queries/notes";
import { getAllTags } from "@/db/queries/tags";

import Link from "next/link";
import { getCurrentUserId } from "@/lib/currentUser";
import { getReferencesByUserId } from "@/db/queries/references";

type EditNotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id } = await params;
const userId = await getCurrentUserId();
const details = await getNoteDetailsById(id);
const tags = await getAllTags();
const references = await getReferencesByUserId(userId);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
      <div className="mx-auto mb-6 max-w-3xl">
        <Link
          href={`/notes/${id}`}
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to note
        </Link>
      </div>

      <EditNoteForm
        note={details.note}
        tags={tags}
        noteTags={details.tags}
        references={references}
        noteReferences={details.references}
        userId={userId}
      />
    </main>
  );
}
