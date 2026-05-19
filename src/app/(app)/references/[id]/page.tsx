import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";
import { notFound } from "next/navigation";

import ReferenceCard from "@/components/references/ReferenceCard";
import PageQuickActions from "@/components/shared/PageQuickActions";
import { getCurrentUserId } from "@/db/queries/users";
import {
  getReferenceById,
  getReferencesForUser,
} from "@/db/queries/references";
import { getUserProjectsAction } from "@/app/actions/projects";
import { getTagsForUser } from "@/db/queries/tags";
import { getNotesForUser } from "@/db/queries/notes";
import { redirect } from "next/navigation";

type ReferenceDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function ReferenceDetailsPage({
  params,
  searchParams,
}: ReferenceDetailsPageProps) {
const userId = await getCurrentUserId();
console.log("UserId:", userId)
if (!userId) {
  redirect("/sign-in");
}

  const { id } = await params;
  const { from } = await searchParams;



  const reference = await getReferenceById(id, userId);

  if (!reference) {
    notFound();
  }

  const projects = await getUserProjectsAction();
  const tags = await getTagsForUser(userId);
  const references = await getReferencesForUser(userId);
  const notes = await getNotesForUser(userId);

  const noteOptions = notes.map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
  }));

  const backHref = from ? decodeURIComponent(from) : "/references";

  return (
    <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/references"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Library size={16} />
            All references
          </Link>

          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <PageQuickActions
            entityType="reference"
            entityId={reference.id}
            userId={userId}
            tags={tags}
            references={references}
            notes={noteOptions}
            projects={projects}
            attachedTagIds={[]}
            linkedNoteIds={[]}
            linkedReferenceIds={[]}
            tagSuggestionText={`${reference.title} ${reference.author ?? ""} ${reference.notes ?? ""}`}
          />

          <ReferenceCard reference={reference} />
        </div>
      </div>
    </main>
  );
}
