import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import NewNoteComposer from "@/components/notes/NewNoteComposer";
import { getCurrentUserId } from "@/db/queries/users";
import { getNotesByUser } from "@/db/queries/notes";
import { getTagsForUser } from "@/db/queries/tags";
import { getReferencesForUser } from "@/db/queries/references";

export default async function NewNotePage() {
  const userId = await getCurrentUserId();

  const [notes, tags, references] = await Promise.all([
    getNotesByUser(userId),
    getTagsForUser(userId),
    getReferencesForUser(userId),
  ]);

return (
  <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-8 text-[rgb(var(--text))]">
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <Link
          href="/notes"
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm font-medium text-[rgb(var(--text))] shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-[rgb(var(--text))]">
          Create Note
        </h1>

        <p className="mt-2 text-[rgb(var(--muted))]">
          Create a new note with tags, links, references, and rich content.
        </p>
      </header>

      <NewNoteComposer
        notes={notes}
        tags={tags}
        references={references}
        heading="Create New Note"
      />
    </div>
  </main>
);
}
