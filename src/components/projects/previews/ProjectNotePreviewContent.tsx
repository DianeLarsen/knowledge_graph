import Link from "next/link";
import NoteCard from "@/components/notes/card/NoteCard";
import { getNoteDetailsById, getNotesForUser } from "@/db/queries/notes";
import { getReferencesForUser } from "@/db/queries/references";
import { getTagsForUser } from "@/db/queries/tags";

type ProjectNotePreviewContentProps = {
  noteId: string;
};

export default async function ProjectNotePreviewContent({
  noteId,
}: ProjectNotePreviewContentProps) {
  const data = await getNoteDetailsById(noteId);

  if (!data) {
    return <p className="text-sm text-gray-500">Note not found.</p>;
  }

  const userId = data.note.createdByUserId;

  const [notes, userTags, userReferences] = await Promise.all([
    getNotesForUser(userId),
    getTagsForUser(userId),
    getReferencesForUser(userId),
  ]);

  const noteOptions = notes.map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content ?? "",
  }));

  return (
    <div className="space-y-4">
      <NoteCard
        data={data}
        userId={userId}
        allNotes={noteOptions}
        userTags={userTags}
        userReferences={userReferences}
      />

      <div className="flex justify-end">
        <Link
          href={`/notes/${noteId}`}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Open Full Note
        </Link>
      </div>
    </div>
  );
}
