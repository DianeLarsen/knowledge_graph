import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentUserId } from "@/db/queries/users";
import {
  getEventById,
  getTagIdsForEvent,
  getLinkedNoteIdsForEvent,
  getLinkedReferenceIdsForEvent,
  getLinkedProjectIdsForEvent,
} from "@/db/queries/calendar";
import { getUserProjects } from "@/db/queries/projects";
import { getTagsForUser } from "@/db/queries/tags";
import { getReferencesForUser } from "@/db/queries/references";
import { getNotesForUser } from "@/db/queries/notes";
import EventDetailsPageClient from "@/components/calendar/EventDetailsPageClient";

type EventDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  let userId: string;

  try {
    userId = await getCurrentUserId();
  } catch {
    redirect("/");
  }

  const { id } = await params;

  const [
    event,
    projects,
    tags,
    references,
    notes,
    attachedTagIds,
    linkedNoteIds,
    linkedReferenceIds,
    linkedProjectIds,
  ] = await Promise.all([
    getEventById(id, userId),
    getUserProjects(userId),
    getTagsForUser(userId),
    getReferencesForUser(userId),
    getNotesForUser(userId),
    getTagIdsForEvent(userId, id),
    getLinkedNoteIdsForEvent(userId, id),
    getLinkedReferenceIdsForEvent(userId, id),
    getLinkedProjectIdsForEvent(userId, id),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-4 py-6 text-[rgb(var(--text))]">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/calendar"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-1.5 text-sm font-medium text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
        >
          <ArrowLeft size={16} />
          Back to calendar
        </Link>

        <EventDetailsPageClient
          event={event}
          userId={userId}
          projects={projects}
          tags={tags}
          references={references}
          notes={notes}
          attachedTagIds={attachedTagIds}
          linkedNoteIds={linkedNoteIds}
          linkedReferenceIds={linkedReferenceIds}
          linkedProjectIds={linkedProjectIds}
        />
      </div>
    </main>
  );
}
