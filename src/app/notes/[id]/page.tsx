import NoteCard from "@/components/NoteCard";
import { getNoteDetailsById } from "@/db/queries/notes";
import Link from "next/link";

type NoteDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NoteDetailsPage({
  params,
}: NoteDetailsPageProps) {
  const { id } = await params;

  const data = await getNoteDetailsById(id);

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-300">Note not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
      <div className="mx-auto mb-6 max-w-3xl">
        <Link
          href="/notes"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to notes
        </Link>
      </div>

      <NoteCard data={data} />
    </main>
  );
}
