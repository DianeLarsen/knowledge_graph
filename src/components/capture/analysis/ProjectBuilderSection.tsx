import type { ReactNode } from "react";

type ProjectBuilderSectionProps = {
  title: string;
  children: ReactNode;
};

export default function ProjectBuilderSection({
  title,
  children,
}: ProjectBuilderSectionProps) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h4>

      <div className="space-y-2">{children}</div>
    </section>
  );
}
