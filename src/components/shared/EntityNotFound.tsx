// components/shared/EntityNotFound.tsx
import Link from "next/link";

type EntityNotFoundProps = {
  entityName: string;
  backHref: string;
  backLabel: string;
};

export default function EntityNotFound({
  entityName,
  backHref,
  backLabel,
}: EntityNotFoundProps) {
  return (
    <main
      className="
        flex min-h-[calc(100vh-105px)]
        items-center justify-center
        bg-[rgb(var(--bg))]
        px-6
      "
    >
      <section className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
          Not found
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[rgb(var(--text))]">
          {entityName} does not exist
        </h1>

        <p className="mt-4 text-sm leading-6 text-[rgb(var(--muted))]">
          It may have been deleted, moved, or the link may be wrong. Naturally,
          the URL chose violence.
        </p>

        <Link
          href={backHref}
          className="
            mt-8 inline-flex items-center rounded-lg
            border border-[rgb(var(--border))]
            bg-[rgb(var(--card))]
            px-4 py-2 text-sm font-medium
            text-[rgb(var(--text))]
            transition hover:brightness-95
          "
        >
          {backLabel}
        </Link>
      </section>
    </main>
  );
}
