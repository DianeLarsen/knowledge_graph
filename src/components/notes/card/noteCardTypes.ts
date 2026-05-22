import { Note, Reference, Tag, type RelationshipType } from "@/db/schema";
import { TagColor } from "@/lib/types/tags/tagColors";
import type { NoteLinkedReference } from "@/lib/types/references/referenceTypes";

export type LinkedNoteSummary = {
  id: string;
  title: string;
};

export type NoteCardTag = Tag & {
  color: TagColor | null;
};

export type LinkedTaskSummary = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "awaiting" | "done" | "archived";
};

export type LinkedEventSummary = {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  status: "planned" | "done" | "cancelled";
};

export type OutgoingLink = {
  id: string;
  relationshipType: RelationshipType;
  label: string | null;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  targetTitle: string | null;
  targetContent: string | null;
  targetTask?: LinkedTaskSummary | null;
  targetEvent?: LinkedEventSummary | null;
};

export type Backlink = {
  id: string;
  relationshipType: RelationshipType;
  label: string | null;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  sourceTitle: string | null;
  sourceContent: string | null;
  sourceTask?: LinkedTaskSummary | null;
  sourceEvent?: LinkedEventSummary | null;
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
