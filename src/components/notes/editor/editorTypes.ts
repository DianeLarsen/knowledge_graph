import type { Note, Tag, Reference } from "@/db/schema";
import { TagColor } from "@/lib/types/tags/tagColors";
import type { NoteLinkedReference } from "@/lib/types/references/referenceTypes";


export type InlineMentionRange = {
  from: number;
  to: number;
  tagId?: string;
  tagName?: string;
};

export type MentionSuggestionItem = {
  id: string;
  label: string;
};

export type MentionSuggestionProps = {
  items: MentionSuggestionItem[];
  clientRect?: (() => DOMRect | null) | null;
  command: (item: MentionSuggestionItem) => void;
};

export type ContextMenuTag = {
  tagId?: string;
  tagName?: string;
};

export type ContextMenuReference = {
  referenceId?: string;
  referenceTitle?: string;
};

export type ContextMenuNoteLink = {
  noteId?: string;
  noteTitle?: string;
};

export type ContextMenuState = {
  x: number;
  y: number;
  from: number;
  to: number;
  tags: ContextMenuTag[];
  references: ContextMenuReference[];
  hasTagMark: boolean;
  hasReferenceMark: boolean;
  mode?: "full" | "removeOnly";
  noteLinks: ContextMenuNoteLink[];
  hasNoteLinkMark: boolean;
} | null;

export type RichNoteEditorProps = {
  initialContent: string;
  tags: Tag[];
  references?: Reference[];
  onTagUsed?: (tagName: string) => void;
  onReferenceUsed?: (referenceId: string) => void;
  onChange: (data: { plainText: string; json: string }) => void;
  getReferenceLabel: (reference: Reference) => string;
  onReferenceRemoved?: (referenceId: string) => void;
  onTagRemoved?: (tagName: string) => void;
  tagColorMap?: Record<string, TagColor>;
  inlineReferenceIds: string[];
  selectedReferenceIds: string[];
  openConfirmDialog: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
  }) => void;
  availableNotes?: LinkedNoteSummary[];
  onNoteLinkUsed?: (noteId: string) => void;
  onNoteLinkRemoved?: (noteId: string) => void;
};

export type AiSuggestedTag = {
  name: string;
  exists: boolean;
};

export type LinkedNoteSummary = {
  id: string;
  title: string;
};

export type EditNoteFormProps = {
  note: Note;
  tags: Tag[];
  noteTags: Tag[];
  references: Reference[];
  noteReferences: NoteLinkedReference[];
  availableNotes: LinkedNoteSummary[];
  linkedNoteIds: string[];
  onCancel?: () => void;
  onSave?: (updatedNote: Note) => void;
};