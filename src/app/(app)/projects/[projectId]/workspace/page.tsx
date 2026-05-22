// /app/projects/workspace/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTagsForEntity } from "@/db/queries/tags";
import ProjectWorkspaceBoard from "@/components/projects/ProjectWorkspaceBoard";
import {
  getAvailableProjectItemsAction,
  getProjectByIdAction,
  getProjectItemsWithDetailsAction,
} from "@/app/actions/projects";

import ProjectWorkspaceActions from "@/components/projects/ProjectWorkspaceActions";
import { getNotesForUser } from "@/db/queries/notes";
import { getTagsForUser } from "@/db/queries/tags";
import { getReferencesForUser } from "@/db/queries/references";
import { getCurrentUserId } from "@/db/queries/users";
import ProjectItemPreviewModal from "@/components/projects/previews/ProjectItemPreviewModal";

type ProjectWorkspacePageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    previewType?: string;
    previewId?: string;
  }>;
};

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: ProjectWorkspacePageProps) {
  const { projectId } = await params;
  const preview = await searchParams;


  const project = await getProjectByIdAction(projectId);

  if (!project) {
    notFound();
  }
  const userId = await getCurrentUserId();

  const [items, availableItems, notes, tags, references, projectTags] = await Promise.all([
    getProjectItemsWithDetailsAction(project.id),
    getAvailableProjectItemsAction(project.id),
    getNotesForUser(userId),
    getTagsForUser(userId),
    getReferencesForUser(userId),
    getTagsForEntity(userId, "project", project.id),
  ]);

  const sources = items.filter((item) => item.projectRole === "source");
  const workingItems = items.filter((item) => item.projectRole === "working");
  const completed = items.filter((item) => item.projectRole === "completed");
  const referenceItems = items.filter(
    (item) => item.projectRole === "reference",
  );
 

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Project
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {project.title} Workspace
          </h1>

          {project.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {project.description}
            </p>
          )}
        </div>
      </header>
      <ProjectWorkspaceActions
        projectId={project.id}
        projectTitle={project.title}
        projectDescription={project.description}
        isEmptyProject={items.length === 0}
        existingItems={availableItems}
        notes={notes}
        tags={tags}
        references={references}
        attachedTagIds={projectTags.map((tag) => tag.id)}
      />
      <section className="grid gap-4 lg:grid-cols-[1fr_1.5fr_1fr]">
        <ProjectWorkspaceBoard title="Sources" items={sources} />
        <ProjectWorkspaceBoard title="Working" items={workingItems} featured />
        <ProjectWorkspaceBoard title="Completed" items={completed} />
      </section>

      <section>
        <ProjectWorkspaceBoard title="References" items={referenceItems} />
      </section>
      {preview.previewType && preview.previewId && (
        <ProjectItemPreviewModal
          projectId={project.id}
          previewType={preview.previewType}
          previewId={preview.previewId}
        />
      )}
    </main>
  );
}
