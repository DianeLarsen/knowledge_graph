import Link from "next/link";

type ProjectWorkspaceToolbarProps = {
  projectId: string;
};

export default function ProjectWorkspaceToolbar({
  projectId,
}: ProjectWorkspaceToolbarProps) {
  return (
    <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <Link
        href={`/notes/new?projectId=${projectId}`}
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        New Note
      </Link>

      <Link
        href={`/tasks/new?projectId=${projectId}`}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        New Task
      </Link>

      <Link
        href={`/capture/new?projectId=${projectId}`}
        className="rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
      >
        New Capture
      </Link>

      <Link
        href={`/calendar/new?projectId=${projectId}`}
        className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700"
      >
        New Event
      </Link>
    </section>
  );
}
