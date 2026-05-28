type EventPreviewCardProps = {
  title: string;
  dateLabel?: string | null;
  status?: string | null;
  location?: string | null;
  description?: string | null;
  onClose?: () => void;
  onOpen?: () => void;
};

export default function EventPreviewCard({
  title,
  dateLabel,
  status,
  location,
  description,
  onClose,
  onOpen,
}: EventPreviewCardProps) {
  return (
    <div className="w-80 overflow-hidden rounded-2xl border border-sky-300 bg-white shadow-xl dark:border-sky-800 dark:bg-gray-950">
      <div className="border-b border-sky-200 px-4 py-2 dark:border-sky-900/60">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>

          <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
            Event
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {dateLabel && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {dateLabel}
            </span>
          )}

          {status && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 p-4">
        {location && (
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            📍 {location}
          </p>
        )}

        <p className="line-clamp-4 text-xs leading-5 text-gray-700 dark:text-gray-300">
          {description?.trim() || "No event description available."}
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
            className="rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-sky-700"
          >
            Open event
          </button>
        )}
      </div>
    </div>
  );
}
