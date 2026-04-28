import { getNotesByUser } from "@/db/queries/notes";
import { getTagsByUser } from "@/db/queries/tags";
import { getNoteTagsByUser } from "@/db/queries/notetags";
import NotesWorkspace from "@/components/NotesWorkspace";

export default async function WorkspacePage() {
  const userId = "72d9a5a1-00f1-471b-8abd-5d8e838241db";

  const notes = await getNotesByUser(userId);
  const tags = await getTagsByUser(userId);
  const noteTags = await getNoteTagsByUser(userId);

  return <NotesWorkspace notes={notes} tags={tags} noteTags={noteTags} />;
}
