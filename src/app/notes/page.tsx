import { getNotesByUser } from "@/db/queries/notes";
import { Note } from "@/db/schema";
import Link from "next/link";

export default async function NotesPage() {
  const userId = "72d9a5a1-00f1-471b-8abd-5d8e838241db";
  const notes = await getNotesByUser(userId);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Notes
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your collected notes, because apparently brains need external hard
            drives.
          </p>
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
