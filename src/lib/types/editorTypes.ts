import { Tag, Reference } from "@/db/schema";
import { TagColor } from "@/lib/types/tags/tagColors";

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

export type ContextMenuState = {
  x: number;
  y: number;
  from: number;
  to: number;
  hasTagMark: boolean;
  hasReferenceMark: boolean;
  tagName?: string;
  referenceTitle?: string;
  tags: ContextMenuTag[];
  references: ContextMenuReference[];
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
};
