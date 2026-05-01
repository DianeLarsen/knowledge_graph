import { getNotesByUser } from "@/db/queries/notes";
import { Note } from "@/db/schema";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/currentUser";

export default async function NotesPage() {
  const userId = await getCurrentUserId();
  const notes = await getNotesByUser(userId);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Notes
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your collected notes, because apparently brains need external hard
              drives.
            </p>
          </div>

          <Link
            href="/notes/references"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            View References
          </Link>
        </header>

        {notes.length > 0 ? (
          <ul className="grid gap-4">
            {notes.map((note: Note) => (
              <li
                key={note.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <Link href={`/notes/${note.id}`} className="block">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400">
                    {note.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-gray-600 dark:text-gray-400">
                    {note.content || "No content yet."}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            No notes found.
          </div>
        )}
      </div>
    </main>
  );
}
