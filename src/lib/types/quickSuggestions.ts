import type { LinkTargetType } from "@/components/shared/quick-actions/QuickLinkActions";

export type QuickCreateSuggestionType = "task" | "note" | "event" | "capture";

export type QuickCreateSuggestion = {
  type: QuickCreateSuggestionType;
  title: string;
  reason?: string;
};

export type QuickLinkSuggestion = {
  type: LinkTargetType;
  id: string;
  title: string;
  reason?: string;
};
