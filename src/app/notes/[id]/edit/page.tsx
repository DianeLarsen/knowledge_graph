import EditNoteForm from "@/components/EditNoteForm";
import { getNoteById } from "@/db/queries/notes";
import { getTagsByUser } from "@/db/queries/tags";
import { getTagsForNote } from "@/db/queries/notetags";
import Link from "next/link";

type EditNotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id } = await params;

  const note = await getNoteById(id);

  if (!note) {
    return <div>Note not found.</div>;
  }

  const tags = await getTagsByUser(note.userId);
  const noteTags = await getTagsForNote(note.id);

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

      <EditNoteForm note={note} tags={tags} noteTags={noteTags} />
    </main>
  );
}
