type TaskPreviewCardProps = {
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  onClose?: () => void;
  onOpen?: () => void;
};

export default function TaskPreviewCard({
  title,
  description,
  status,
  priority,
  onClose,
  onOpen,
}: TaskPreviewCardProps) {
  return (
    <div className="w-80 overflow-hidden rounded-2xl border border-amber-300 bg-white shadow-xl dark:border-amber-800 dark:bg-gray-950">
      <div className="border-b border-amber-200 px-4 py-2 dark:border-amber-900/60">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>

          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
            Task
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {status && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {status}
            </span>
          )}

          {priority && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
              {priority}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="line-clamp-5 text-xs leading-5 text-gray-700 dark:text-gray-300">
          {description?.trim() || "No task description available."}
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
            className="rounded-full bg-amber-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-amber-700"
          >
            Open task
          </button>
        )}
      </div>
    </div>
  );
}
