import { getNotesByUser } from "@/db/queries/notes";
import { getTagsByUser } from "@/db/queries/tags";
import NewNoteComposer from "@/components/NewNoteComposer";

export default async function WorkspacePage() {
  const userId = "72d9a5a1-00f1-471b-8abd-5d8e838241db";

  const notes = await getNotesByUser(userId);
  const tags = await getTagsByUser(userId);

  return (
    <main className="grid min-h-screen gap-4 bg-gray-50 p-4 dark:bg-gray-950 lg:grid-cols-[280px_1fr_360px]">
      <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Cards
        </h2>

        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
            >
              {note.title}
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Open Cards
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Multi-card viewer goes here next.
        </p>
      </section>

      <NewNoteComposer notes={notes} tags={tags} />
    </main>
  );
}
