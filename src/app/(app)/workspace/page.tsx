import { getNoteDetailsByUserId } from "@/db/queries/notes";
import NotesWorkspace from "@/components/notes/workspace/NotesWorkspace";
import { getCurrentUserId } from "@/db/queries/users";
import { getReferencesForUser } from "@/db/queries/references";
import { getUserProjects } from "@/db/queries/projects";

export default async function WorkspacePage() {
  const userId = await getCurrentUserId();

  const [references, dataList, projects] = await Promise.all([
    getReferencesForUser(userId),
    getNoteDetailsByUserId(userId),
    getUserProjects(userId),
  ]);

  return (
    <NotesWorkspace
      dataList={dataList}
      userId={userId}
      references={references}
      projects={projects}
    />
  );
}
