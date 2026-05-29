import Link from "next/link";

type MiniNotePreviewCardProps = {
  title: string;
  content?: string | null;
  relationshipLabel?: string;
  tagName?: string;
  noteId?: string;
  onClose?: () => void;
  onOpen?: (noteId: string) => void;
  onLink?: (noteId: string) => void;
};

export default function MiniNotePreviewCard({
  title,
  content,
  relationshipLabel,
  tagName,
  noteId,
  onClose,
  onOpen,
  onLink,
}: MiniNotePreviewCardProps) {
  return (
    <div
      className="
        w-80 overflow-hidden rounded-2xl border border-gray-300
        bg-white shadow-xl
        dark:border-gray-700 dark:bg-gray-950
      "
    >
      <div className="border-b border-red-200 px-4 py-2 dark:border-red-900/60">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>

          <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
            Note
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {relationshipLabel && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {relationshipLabel}
            </span>
          )}

          {tagName && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
              #{tagName}
            </span>
          )}
        </div>
      </div>

      <div
        className="
          h-32 overflow-hidden
          bg-[linear-gradient(to_bottom,transparent_27px,#93c5fd_28px,transparent_29px)]
          bg-[length:100%_30px]
          bg-[position:0_0px]
          dark:bg-[linear-gradient(to_bottom,transparent_27px,#60a5fa_28px,transparent_29px)]
        "
      >
        <p
          className="
            line-clamp-4 px-4 pt-[5.75px]
            text-xs leading-[30px] text-gray-700
            dark:text-gray-300
          "
        >
          {content?.trim() || "No preview text available."}
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
        {noteId && onLink && (
          <button
            type="button"
            onClick={() => onLink(noteId)}
            className="rounded-full border border-purple-200 px-3 py-1 text-[10px] font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-200 dark:hover:bg-purple-950/40"
          >
            Link note
          </button>
        )}
        {noteId && onOpen && (
          <Link
            href={`/notes/${noteId}`}
            className="rounded-full bg-purple-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-purple-700"
          >
            Open note
          </Link>
        )}
      </div>
    </div>
  );
}
