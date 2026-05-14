import Link from "next/link";

type ProjectWorkspaceItemCardProps = {
  item: {
    id: string;
    title: string;
    subtitle: string | null;
    href?: string;
    entityType: string;
    status?: string | null;
    projectRole: string;
    tags?: {
      id: string;
      name: string;
    }[];
  };
  mode?: "link" | "button";
  onSelect?: () => void;
};

const ENTITY_LABELS: Record<string, string> = {
  note: "Note",
  task: "Task",
  event: "Event",
  reference: "Reference",
  capture: "Capture",
};

const ENTITY_STYLES: Record<string, string> = {
  note: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  task: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  event:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300",
  reference:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  capture:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export default function ProjectWorkspaceItemCard({
  item,
  mode = "link",
  onSelect,
}: ProjectWorkspaceItemCardProps) {

  const entityLabel = ENTITY_LABELS[item.entityType] ?? item.entityType;
  const entityStyle =
    ENTITY_STYLES[item.entityType] ??
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300";
  
  if (!item.href) {
    console.log("Missing href project item:", item);
  }
  const href = item.href ?? "#";

  const cardContent = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {item.title}
        </div>

        {item.subtitle && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
            {item.subtitle}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                #{tag.name}
              </span>
            ))}

            {item.tags.length > 5 && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
                +{item.tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${entityStyle}`}
        >
          {entityLabel}
        </span>

        {item.status && (
          <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {item.status}
          </span>
        )}
      </div>
    </div>
  );
  if (mode === "button") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-left text-sm shadow-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-700 dark:hover:bg-blue-950/40"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="block rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm shadow-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-700 dark:hover:bg-blue-950/40"
    >
      {cardContent}
    </Link>
  );
}
