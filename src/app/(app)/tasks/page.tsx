import { getTasksByUserId, getTaskQuickActionState } from "@/db/queries/tasks";
import { getCurrentUserId } from "@/db/queries/users";
import TaskBoard from "@/components/tasks/Taskboard";
import { getUserProjectsAction } from "@/app/actions/projects";
import { getTagsForUser } from "@/db/queries/tags";
import { getReferencesForUser } from "@/db/queries/references";
import { getNotesForUser } from "@/db/queries/notes";


export default async function TasksPage() {
  const userId = await getCurrentUserId();
  const tasks = await getTasksByUserId(userId);
  const projects = await getUserProjectsAction();
  const tags = await getTagsForUser(userId);
  const references = await getReferencesForUser(userId);
  const notes = await getNotesForUser(userId);

const noteOptions = notes.map((note) => ({
  id: note.id,
  title: note.title,
  content: note.content,
}));


const taskQuickActionState = await getTaskQuickActionState(userId);

const tasksWithQuickActionState = tasks.map((task) => {
  const quickState = taskQuickActionState.get(task.id);

  return {
    ...task,
    attachedTagIds: quickState?.attachedTagIds ?? [],
    linkedNoteIds: quickState?.linkedNoteIds ?? [],
    linkedReferenceIds: quickState?.linkedReferenceIds ?? [],
  };
});

  return (
    <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
      <TaskBoard
        userId={userId}
        initialTasks={tasksWithQuickActionState}
        projects={projects}
        tags={tags}
        references={references}
        notes={noteOptions}
      />
    </main>
  );
}