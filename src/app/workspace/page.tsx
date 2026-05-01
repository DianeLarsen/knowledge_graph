import { getNoteDetailsByUserId } from "@/db/queries/notes";
import NotesWorkspace from "@/components/notes/NotesWorkspace";
import { getCurrentUserId } from "@/lib/currentUser";
import { getReferencesByUserId } from "@/db/queries/references";

export default async function WorkspacePage() {
  const userId = await getCurrentUserId();
  const references = await getReferencesByUserId(userId);
  const dataList = await getNoteDetailsByUserId(userId);

  return (
    <NotesWorkspace
      dataList={dataList}
      userId={userId}
      references={references}
    />
  );
}
