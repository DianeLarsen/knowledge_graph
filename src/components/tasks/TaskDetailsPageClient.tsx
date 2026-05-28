"use client";

import type { Project, Task } from "@/db/schema";
import type {
  QuickTag,
  QuickReference,
  QuickNote,
} from "@/lib/types/quickTypes";
import TaskDetailsPanel from "@/components/tasks/TaskDetailsPanel";

type TaskDetailsPageClientProps = {
  task: Task;
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

export default function TaskDetailsPageClient({
  task,
  userId,
  projects,
  tags,
  references,
  notes,
  attachedTagIds = [],
  linkedNoteIds = [],
    linkedReferenceIds = [],
    linkedProjectIds = [],
}: TaskDetailsPageClientProps) {



  return (
    <TaskDetailsPanel
      variant="page"
      task={task}
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
