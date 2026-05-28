"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProjectWorkspaceItemCard from "@/components/projects/ProjectWorkspaceItemCard";
import type { ProjectItemWithDetails } from "@/db/queries/projects";
import type { ProjectItem } from "@/db/schema";
import { updateProjectItemRoleAction } from "@/app/actions/projects";

type ProjectWorkspaceBoardProps = {
  title: string;
  role: ProjectItem["projectRole"];
  items: ProjectItemWithDetails[];
  featured?: boolean;
};

export default function ProjectWorkspaceBoard({
  title,
  role,
  items,
  featured = false,
}: ProjectWorkspaceBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function openPreview(item: ProjectItemWithDetails) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("previewType", item.entityType);
    params.set("previewId", item.entityId);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleDragStart(
    event: React.DragEvent<HTMLLIElement>,
    item: ProjectItemWithDetails,
  ) {
    event.dataTransfer.setData("projectItemId", item.id);
    event.dataTransfer.effectAllowed = "move";
  }

async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();

  const projectItemId = event.dataTransfer.getData("projectItemId");

  if (!projectItemId) return;

  await updateProjectItemRoleAction({
    projectItemId,
    projectRole: role,
  });

  router.refresh();
}

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 ${
        featured ? "min-h-[520px]" : "min-h-[320px]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>

        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Drop items here.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              draggable
              onDragStart={(event) => handleDragStart(event, item)}
              className="cursor-grab active:cursor-grabbing"
            >
              <ProjectWorkspaceItemCard
                item={item}
                mode="button"
                onSelect={() => openPreview(item)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
