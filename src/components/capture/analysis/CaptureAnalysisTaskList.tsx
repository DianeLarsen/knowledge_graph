import type { CaptureAnalysisData } from "./CaptureAnalysisTypes";

type Task = CaptureAnalysisData["possibleTasks"][number];

type CaptureAnalysisTaskListProps = {
  tasks: Task[];
  onCreateTask: (index: number, task: Task) => Promise<void>;
};

export default function CaptureAnalysisTaskList({
  tasks,
  onCreateTask,
}: CaptureAnalysisTaskListProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
        Possible Tasks
      </h4>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={`${task.title}-${index}`}
            className="rounded-lg border border-purple-200 bg-white p-3 dark:border-purple-800 dark:bg-gray-950"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {task.title}
            </p>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {task.description}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Priority: {task.priority}
            </p>

            <div className="mt-3">
              {task.duplicateWarning && (
                <div className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                  Similar task found:{" "}
                  <span className="font-semibold">{task.similarTaskTitle}</span>
                </div>
              )}

              {task.created && task.taskId ? (
                <a
                  href={`/tasks#task-${task.taskId}`}
                  className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                >
                  Task Created - View Task
                </a>
              ) : task.created ? (
                <span className="inline-flex rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                  Task Created
                </span>
              ) : task.duplicateWarning ? (
                <span className="inline-flex rounded-md bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                  Possible Duplicate
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onCreateTask(index, task)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Create Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
