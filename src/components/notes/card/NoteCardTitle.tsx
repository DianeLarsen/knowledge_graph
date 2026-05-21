import IndexLine from "./IndexLine";

export default function NoteCardTitle({
  title,
  compact,
}: {
  title: string;
  compact: boolean;
}) {
  return (
    <IndexLine isRed compact={compact} className="group relative z-10 min-w-0">
      <h1
        title={title}
        className={`
          block w-full min-w-0 max-w-full truncate whitespace-nowrap
          font-['Comic_Sans_MS','Bradley_Hand',cursive]
          font-semibold
          text-gray-900 dark:text-slate-100
          ${compact ? "text-xl leading-7" : "text-2xl leading-8"}
        `}
      >
        {title}
      </h1>

      <div
        className="
          pointer-events-none absolute left-4 top-full z-50 mt-1 hidden
          max-w-sm rounded-lg border bg-white px-3 py-2 text-sm font-semibold shadow-lg
          group-hover:block
          dark:bg-slate-900
        "
      >
        {title}
      </div>
    </IndexLine>
  );
}
