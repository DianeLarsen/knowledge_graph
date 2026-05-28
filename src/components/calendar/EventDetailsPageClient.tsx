"use client";

import type { Event, Project } from "@/db/schema";
import type {
  QuickTag,
  QuickReference,
  QuickNote,
} from "@/lib/types/quickTypes";
import EventDetailsPanel from "@/components/calendar/EventDetailsPanel";

type EventDetailsPageClientProps = {
  event: Event;
  userId: string;
  projects: Project[];
  tags: QuickTag[];
  references: QuickReference[];
  notes: QuickNote[];
  attachedTagIds?: string[];
  linkedNoteIds?: string[];
  linkedReferenceIds?: string[];
  linkedProjectIds?: string[];
};

export default function EventDetailsPageClient({
  event,
  userId,
  projects,
  tags,
  references,
  notes,
  attachedTagIds = [],
  linkedNoteIds = [],
  linkedReferenceIds = [],
  linkedProjectIds = [],
}: EventDetailsPageClientProps) {
  return (
    <EventDetailsPanel
      variant="page"
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
  );
}
