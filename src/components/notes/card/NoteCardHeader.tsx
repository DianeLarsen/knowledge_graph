export default function NoteCardHeader({
  userId,
  title,
  onEdit,
  onClose,
}: {
  userId: string;
  title: string;
  onEdit: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="absolute right-2 top-2 z-50 flex min-w-0 max-w-full items-center gap-1 overflow-hidden">
      {userId && (
        <button
          type="button"
          onClick={onEdit}
          className="
            flex h-6 w-6 items-center justify-center
            rounded-full border border-gray-300 bg-white
            text-xs font-bold text-gray-600 shadow-sm transition
            hover:border-blue-400 hover:bg-blue-100 hover:text-blue-700
            dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
            dark:hover:border-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-200
          "
          title="Edit note"
        >
          ✎
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="
            flex h-6 w-6 items-center justify-center
            rounded-full border border-gray-300 bg-white
            text-sm font-bold text-gray-600 shadow-sm transition
            hover:border-red-400 hover:bg-red-500 hover:text-white
            dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
            dark:hover:border-red-400 dark:hover:bg-red-500 dark:hover:text-white
          "
        >
          ×
        </button>
      )}
    </div>
  );
}
