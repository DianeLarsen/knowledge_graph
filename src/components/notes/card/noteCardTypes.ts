import { Note, Reference, Tag, type RelationshipType } from "@/db/schema";
import { TagColor } from "@/lib/types/tags/tagColors";
import type { NoteLinkedReference } from "@/lib/types/references/referenceTypes";

type LinkedNotePreviewDetails = {
  id: string;
  title: string | null;
  content: string | null;
  contentJson: string | null;
  updatedAt: Date | string | null;
};

export type LinkedTaskSummary = {
  id: string;
  title: string | null;
  description: string | null;
  status: "todo" | "in_progress" | "awaiting" | "done" | "archived" | null;
  priority: "low" | "medium" | "high" | null;
};

export type LinkedEventSummary = {
  id: string;
  title: string | null;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  allDay: boolean | null;
  status: "planned" | "done" | "cancelled" | null;
  location: string | null;
};

export type LinkedProjectSummary = {
  id: string;
  title: string | null;
  description: string | null;
};

export type LinkedNoteSummary = {
  id: string;
  title: string;
};

export type NoteCardTag = Tag & {
  color: TagColor | null;
};

export type OutgoingLink = {
  id: string;
  relationshipType: RelationshipType;
  label: string | null;
  metadata?: string | null;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;

  targetTitle: string | null;

  targetNote?: LinkedNotePreviewDetails | null;
  targetTask?: LinkedTaskSummary | null;
  targetEvent?: LinkedEventSummary | null;
  targetProject?: LinkedProjectSummary | null;
};

export type Backlink = {
  id: string;
  relationshipType: RelationshipType;
  label: string | null;
  metadata?: string | null;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;

  sourceTitle: string | null;

  sourceNote?: LinkedNotePreviewDetails | null;
  sourceTask?: LinkedTaskSummary | null;
  sourceEvent?: LinkedEventSummary | null;
  sourceProject?: LinkedProjectSummary | null;
};

export type SharedTagNote = {
  id: string;
  title: string;
  content: string | null;
  contentJson: string | null;
  createdByUserId: string;
  ownerType: "user" | "project";
  ownerId: string;
  visibility: "private" | "shared" | "public";
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  sharedTagId: string;
  sharedTagName: string;
};

export type NoteDetails = {
  note: Note;
  tags: NoteCardTag[];
  tagStats?: {
    tag: NoteCardTag;
    stats: {
      tagId: string;
      tagName: string;
      noteCount: number;
    } | null;
  }[];
  outgoingLinks: OutgoingLink[];
  backlinks: Backlink[];
  sharedTags: SharedTagNote[];
  references?: NoteLinkedReference[];
};

export type NoteCardProps = {
  data: NoteDetails;
  onClose?: () => void;
  onOpenNote?: (noteId: string) => void;
  compact?: boolean;
  allNotes?: LinkedNoteSummary[];
  userTags?: NoteCardTag[];
  userReferences?: Reference[];
  userId: string;
  compactTagLimit?: number;
};
