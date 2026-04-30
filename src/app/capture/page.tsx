import { createCaptureAction, getCaptures } from "@/app/actions/capture";
import { Zap } from "lucide-react";

export default async function CapturePage() {
  const captures = await getCaptures();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Zap className="h-7 w-7 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Capture
          </h1>
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Dump messy ideas here. We’ll make sense of them later, because
          apparently your brain insists on filing everything in one drawer.
        </p>
      </div>

      <form action={createCaptureAction} className="mb-10 space-y-4">
        <textarea
          name="rawText"
          rows={10}
          placeholder="Dump your thoughts, project ideas, reminders, references, half-formed plans, suspiciously urgent nonsense..."
          className="w-full rounded-2xl border border-gray-300 bg-white p-4 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
        />

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Save Capture
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Recent Captures
        </h2>

        {captures.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No captures yet. Suspiciously organized. Probably temporary.
          </p>
        ) : (
          <div className="space-y-4">
            {captures.map((capture) => (
              <article
                key={capture.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {capture.status}
                  </span>

                  <time className="text-xs text-gray-400">
                    {capture.createdAt.toLocaleString()}
                  </time>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800 dark:text-gray-200">
                  {capture.rawText}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
