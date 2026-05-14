import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectWorkspaceItemCard from "@/components/projects/ProjectWorkspaceItemCard";
import { getCurrentUserId } from "@/db/queries/users";
import { getTagsForEntity } from "@/db/queries/tags";
import {
  archiveProjectAction,
  getProjectByIdAction,
  getProjectItemsWithDetailsAction,
} from "@/app/actions/projects";


type ProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

type ProjectItem = Awaited<
  ReturnType<typeof getProjectItemsWithDetailsAction>
>[number];

export type ProjectItemWithDetails = ProjectItem & {
  title: string;
  subtitle: string | null;
  href: string;
  status?: string | null;
  tags: {
    id: string;
    name: string;
  }[];
};
const PROJECT_ROLE_LABELS = {
  source: "Sources",
  working: "Working Items",
  completed: "Completed",
  reference: "References",
} as const;

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const project = await getProjectByIdAction(projectId);

  if (!project) {
    notFound();
  }
    const userId = await getCurrentUserId();
  const [items, projectTags] = await Promise.all([
    getProjectItemsWithDetailsAction(project.id),
    getTagsForEntity(userId, "project", project.id),
  ]);

  const groupedItems = {
    source: items.filter((item) => item.projectRole === "source"),
    working: items.filter((item) => item.projectRole === "working"),
    completed: items.filter((item) => item.projectRole === "completed"),
    reference: items.filter((item) => item.projectRole === "reference"),
  };



  const itemTypeCounts = items.reduce<Record<string, number>>(
    (counts, item) => {
      counts[item.entityType] = (counts[item.entityType] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const recentItems = items.slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div>
        <Link
          href="/projects"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Projects
        </Link>
      </div>

      <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {project.title}
            </h1>

            {project.description && (
              <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-gray-300 px-2.5 py-1 capitalize text-gray-600 dark:border-gray-700 dark:text-gray-300">
                {project.status}
              </span>

              <span className="rounded-full border border-gray-300 px-2.5 py-1 capitalize text-gray-600 dark:border-gray-700 dark:text-gray-300">
                {project.visibility}
              </span>

              <span className="rounded-full border border-gray-300 px-2.5 py-1 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                {items.length} linked items
              </span>

              {projectTags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/projects/${project.id}/workspace`}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Open Workspace
            </Link>

            {project.status !== "archived" && (
              <form action={archiveProjectAction.bind(null, project.id)}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Archive
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-1">
        {(Object.keys(groupedItems) as Array<keyof typeof groupedItems>).map(
          (role) => (
            <OverviewStatCard
              key={role}
              label={PROJECT_ROLE_LABELS[role]}
              count={groupedItems[role].length}
            />
          ),
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
          Item Types
        </h2>

        {Object.keys(itemTypeCounts).length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No linked items yet. Suspiciously tidy.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(itemTypeCounts).map(([type, count]) => (
              <span
                key={type}
                className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium capitalize text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                {type}: {count}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <OverviewSection title="Recent Items" items={recentItems} />

        {(Object.keys(groupedItems) as Array<keyof typeof groupedItems>).map(
          (role) => (
            <OverviewSection
              key={role}
              title={PROJECT_ROLE_LABELS[role]}
              items={groupedItems[role]}
              limit={5}
            />
          ),
        )}
      </section>
    </main>
  );
}

function OverviewStatCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-bold leading-none text-gray-900 dark:text-gray-100">
          {count}
        </p>
      </div>
    </div>
  );
}

type OverviewSectionProps = {
  title: string;
  items: ProjectItem[];
  limit?: number;
};

function OverviewSection({ title, items, limit = 6 }: OverviewSectionProps) {
  const visibleItems = items.slice(0, limit);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>

        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          {items.length}
        </span>
      </div>

      {visibleItems.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nothing here yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <ProjectWorkspaceItemCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {hiddenCount > 0 && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          +{hiddenCount} more in workspace
        </p>
      )}
    </section>
  );
}
