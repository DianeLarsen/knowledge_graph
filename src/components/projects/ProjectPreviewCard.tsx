type ProjectPreviewCardProps = {
  title: string;
  description?: string | null;
  role?: string | null;
  itemCount?: number | null;
  onClose?: () => void;
  onOpen?: () => void;
};

export default function ProjectPreviewCard({
  title,
  description,
  role,
  itemCount,
  onClose,
  onOpen,
}: ProjectPreviewCardProps) {
  return (
    <div className="w-80 overflow-hidden rounded-2xl border border-emerald-300 bg-white shadow-xl dark:border-emerald-800 dark:bg-gray-950">
      <div className="border-b border-emerald-200 px-4 py-2 dark:border-emerald-900/60">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>

          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
            Project
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {role && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {role}
            </span>
          )}

          {typeof itemCount === "number" && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              {itemCount} items
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="line-clamp-5 text-xs leading-5 text-gray-700 dark:text-gray-300">
          {description?.trim() || "No project description available."}
        </p>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-2 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Close
        </button>

        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700"
          >
            Open project
          </button>
        )}
      </div>
    </div>
  );
}
