export default function IndexLine({
  children,
  isRed = false,
  compact = false,
  className = "",
}: {
  children?: React.ReactNode;
  isRed?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`
        flex w-full min-w-0 max-w-full items-end overflow-hidden border-b px-4
        ${compact ? "min-h-9" : "min-h-10"}
        ${
          isRed
            ? "border-red-400 dark:border-red-400"
            : "border-blue-300 dark:border-blue-400"
        }
        ${className}
      `}
    >
      <div className="w-full min-w-0 max-w-full flex-1 translate-y-[3px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
