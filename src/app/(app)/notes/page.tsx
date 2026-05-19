import { getNotesByUserWithListMeta } from "@/db/queries/notes";
import { getCurrentUserId } from "@/db/queries/users";
import NotesListClient from "@/components/notes/NotesListClient";

export default async function NotesPage() {
  const userId = await getCurrentUserId();
  const notes = await getNotesByUserWithListMeta(userId);

  return <NotesListClient notes={notes} />;
}
