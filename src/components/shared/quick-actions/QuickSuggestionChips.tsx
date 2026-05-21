type QuickSuggestionChipsProps<T> = {
  title: string;
  suggestions: T[];
  getKey: (suggestion: T) => string;
  getLabel: (suggestion: T) => string;
  getDescription?: (suggestion: T) => string | undefined;
  onSelect: (suggestion: T) => void;
};

export default function QuickSuggestionChips<T>({
  title,
  suggestions,
  getKey,
  getLabel,
  getDescription,
  onSelect,
}: QuickSuggestionChipsProps<T>) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2 dark:border-amber-800 dark:bg-amber-950/30">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
        {title}
      </p>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={getKey(suggestion)}
            type="button"
            onClick={() => onSelect(suggestion)}
            title={getDescription?.(suggestion)}
            className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-slate-950 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            {getLabel(suggestion)}
          </button>
        ))}
      </div>
    </div>
  );
}
