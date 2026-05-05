import Link from "next/link";
import { getReferencesAction } from "@/app/actions/references";
import ReferenceList from "@/components/references/ReferenceList";

export default async function ReferencesPage() {
  const references = await getReferencesAction();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            References
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sources, links, books, articles, and other evidence so your notes do
            not become beautifully formatted nonsense.
          </p>
        </div>

        <Link
          href="/notes"
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Back to Notes
        </Link>
      </div>

      {references.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No references yet. Your claims are currently wandering unsupervised.
        </p>
      ) : (
        <ReferenceList references={references} />
      )}
    </main>
  );
}
