"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProjectWorkspaceItemCard from "@/components/projects/ProjectWorkspaceItemCard";
import type { ProjectItemWithDetails } from "@/db/queries/projects";

type ProjectWorkspaceBoardProps = {
  title: string;
  items: ProjectItemWithDetails[];
  featured?: boolean;
};

export default function ProjectWorkspaceBoard({
  title,
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

  return (
    <div
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
          Nothing here yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
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
