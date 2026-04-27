

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-8 font-sans dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Home
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            A starting point for notes, files, projects, and the loose thoughts
            that would otherwise wander off into the void.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Notes
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Quick access to the notes you touched most recently.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Files
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Documents, references, uploads, and other evidence that chaos has
              a file extension.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Current Work
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              The project you are actually working on, not the twelve you are
              emotionally attached to.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Quick Capture
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add a fast note, idea, file reference, or task before your brain
            throws it into the recycling bin.
          </p>

          <textarea
            className="mt-4 min-h-32 w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="Dump an idea here..."
          />
        </section>
      </main>
    </div>
  );

}
