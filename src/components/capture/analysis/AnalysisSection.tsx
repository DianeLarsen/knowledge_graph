type AnalysisSectionProps = {
  title: string;
  items: string[];
};

export default function AnalysisSection({
  title,
  items,
}: AnalysisSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
        {title}
      </h4>

      <ul className="list-disc space-y-1 pl-5 text-sm text-purple-900 dark:text-purple-100">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
