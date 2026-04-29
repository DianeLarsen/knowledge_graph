import { getTasksByUserId } from "@/db/queries/tasks";
import { getCurrentUserId } from "@/lib/currentUser";
import TaskBoard from "@/components/tasks/Taskboard";

export default async function TasksPage() {
  const userId = await getCurrentUserId();
  const tasks = await getTasksByUserId(userId);

  return (
    <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">


      <TaskBoard userId={userId} initialTasks={tasks} />
    </main>
  );
}
