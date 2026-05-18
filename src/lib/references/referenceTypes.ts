import type { Reference as DbReference } from "@/db/schema";

export type BaseReference = {
  id: string;
  type: DbReference["type"];
  title: string;
  author: string | null;
  url: string | null;
  notes: string | null;
  publisher: string | null;
  publishedDate: Date | string | null;
};

export type LinkedNotePreview = {
  id: string;
  title: string;
  content: string | null;
};

export type LinkedTaskPreview = {
  id: string;
  title: string;
  description: string | null;
};

export type LinkedCapturePreview = {
  id: string;
  title?: string | null;
  summary?: string | null;
};

export type LinkedReferencePreview = {
  id: string;
  title: string;
};

export type ReferenceCardItem = BaseReference & {
  linkCount?: number;
  linkedNotes?: LinkedNotePreview[];
  linkedTasks?: LinkedTaskPreview[];
  linkedCaptures?: LinkedCapturePreview[];
  linkedReferences?: LinkedReferencePreview[];
};

export type NoteLinkedReference = BaseReference & {
  publisher: string | null;
  publishedDate: string | null;
  citation: string | null;

  noteReferenceId: string;
  pageNumber: string | null;
  location: string | null;
  quote: string | null;
  summary: string | null;
};
