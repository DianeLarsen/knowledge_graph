import { getNotesByUser } from "@/db/queries/notes";
import { getTagsByUser } from "@/db/queries/tags";
import { getNoteTagsByUser } from "@/db/queries/notetags";
import NotesWorkspace from "@/components/NotesWorkspace";
import {
  getReferencesByUserId,
  getNoteReferencesByUserId,
} from "@/db/queries/references";
import { getCurrentUserId } from "@/lib/currentUser";


export default async function WorkspacePage() {
  const userId = await getCurrentUserId();

  const notes = await getNotesByUser(userId);
  const tags = await getTagsByUser(userId);
  const noteTags = await getNoteTagsByUser(userId);
  const references = await getReferencesByUserId(userId);
  const noteReferences = await getNoteReferencesByUserId(userId);
  
  return (
    <NotesWorkspace
      notes={notes}
      tags={tags}
      noteTags={noteTags}
      references={references}
      noteReferences={noteReferences}
      userId={userId}
    />
  );
}
