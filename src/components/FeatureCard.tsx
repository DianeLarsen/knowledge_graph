import { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  text: string;
  icon?: ReactNode;
};

export default function FeatureCard({ title, text, icon }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {icon && (
        <div className="mb-3 inline-flex rounded-xl bg-zinc-100 p-2 dark:bg-zinc-800">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{text}</p>
    </div>
  );
}
