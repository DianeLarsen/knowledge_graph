"use client";

import { ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import QuickCreateActions from "@/components/shared/quick-actions/QuickCreateActions";
import QuickProjectActions from "@/components/shared/quick-actions/QuickProjectActions";
import QuickTagActions from "@/components/shared/quick-actions/QuickTagActions";
import QuickLinkActions from "@/components/shared/quick-actions/QuickLinkActions";
import {
  suggestQuickCreatesAction,
  suggestQuickLinksAction,
} from "@/app/actions/quickSuggestions";
import type { EntityType, Project } from "@/db/schema";
import type {
  QuickTag,
  QuickReference,
  QuickNote,
  QuickTask,
  QuickEvent,
} from "@/lib/types/quickTypes";

import type {
  QuickCreateSuggestion,
  QuickLinkSuggestion,
} from "@/lib/types/quickSuggestions";

type PageQuickActionsProps = {
  entityType: EntityType;
  entityId: string;
  userId: string;
  tags: QuickTag[];
  references?: QuickReference[];
  notes?: QuickNote[];
  projects: Project[];
  attachedTagIds?: string[];
  linkedNoteIds?: string[];
  linkedReferenceIds?: string[];
  inlineTagIds?: string[];
  tasks?: QuickTask[];
  events?: QuickEvent[];
  linkedTaskIds?: string[];
  linkedEventIds?: string[];
  onLinkedTaskIdsChange?: (taskIds: string[]) => void;
  onLinkedEventIdsChange?: (eventIds: string[]) => void;
  onAttachedTagIdsChange?: (tagIds: string[]) => void;
  onLinkedNoteIdsChange?: (noteIds: string[]) => void;
  onLinkedReferenceIdsChange?: (referenceIds: string[]) => void;
  tagSuggestionText?: string;
  sourceTitle?: string;
  sourceContent?: string;
};

type QuickActionSectionProps = {
  title: string;
  description?: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

function QuickActionSection({
  title,
  description,
  count,
  defaultOpen = false,
  children,
}: QuickActionSectionProps) {
  const [sectionOpen, setSectionOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm">
      <button
        type="button"
        onClick={() => setSectionOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-3 bg-slate-100 px-3 py-3 text-left transition hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        <span>
          <span className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--text))]">
            {title}
            {typeof count === "number" && (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[rgb(var(--muted))] dark:bg-slate-950">
                {count}
              </span>
            )}
          </span>

          {description && (
            <span className="mt-0.5 block text-xs normal-case tracking-normal text-[rgb(var(--muted))]">
              {description}
            </span>
          )}
        </span>

        <span className="mt-0.5 text-[rgb(var(--muted))]">
          {sectionOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </span>
      </button>

      {sectionOpen && (
        <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
          {children}
        </div>
      )}
    </section>
  );
}

export default function PageQuickActions({
  entityType,
  entityId,
  userId,
  tags,
  references = [],
  notes = [],
  projects,
  attachedTagIds = [],
  linkedNoteIds = [],
  linkedReferenceIds = [],
  inlineTagIds = [],
  tasks = [],
  events = [],
  linkedTaskIds = [],
  linkedEventIds = [],
  onLinkedTaskIdsChange,
  onLinkedEventIdsChange,
  onAttachedTagIdsChange,
  onLinkedNoteIdsChange,
  onLinkedReferenceIdsChange,
  tagSuggestionText = "",
  sourceTitle = "",
  sourceContent = "",
}: PageQuickActionsProps) {
  const [open, setOpen] = useState(false);
  const [isSuggestingCreates, setIsSuggestingCreates] = useState(false);
  const [isSuggestingLinks, setIsSuggestingLinks] = useState(false);
  const [createSuggestions, setCreateSuggestions] = useState<
    QuickCreateSuggestion[]
  >([]);
  const [linkSuggestions, setLinkSuggestions] = useState<QuickLinkSuggestion[]>(
    [],
  );



  async function handleSuggestCreates() {
    if (isSuggestingCreates) return;

    try {
      setIsSuggestingCreates(true);

      const suggestions = await suggestQuickCreatesAction({
        entityType,
        entityId,
        sourceTitle,
        sourceContent,
      });

      setCreateSuggestions(suggestions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggestingCreates(false);
    }
  }

  async function handleSuggestLinks() {
    if (isSuggestingLinks) return;

    try {
      setIsSuggestingLinks(true);

      const suggestions = await suggestQuickLinksAction({
        entityType,
        entityId,
        sourceTitle,
        sourceContent,
        notes,
        references,
        tasks,
        events,
        linkedNoteIds,
        linkedReferenceIds,
        linkedTaskIds,
        linkedEventIds,
      });

      setLinkSuggestions(suggestions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggestingLinks(false);
    }
  }
  return (
    <aside className="relative z-30 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 text-[rgb(var(--text))] shadow-sm lg:sticky lg:top-6 lg:h-fit">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-left text-[rgb(var(--text))] dark:bg-slate-900 lg:hidden"
      >
        <span>
          <span className="block text-sm font-bold">Quick actions</span>
          <span className="block text-xs text-[rgb(var(--muted))]">
            Create, tag, link, and organize this {entityType}
          </span>
        </span>

        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <div className={`${open ? "mt-4 block" : "hidden"} space-y-3 lg:block`}>
        <div className="mb-3 hidden lg:block">
          <h2 className="text-sm font-bold text-[rgb(var(--text))]">
            Quick actions
          </h2>
          <p className="text-xs text-[rgb(var(--muted))]">
            Create, tag, link, and organize this {entityType}.
          </p>
        </div>

        <QuickActionSection
          title="Create"
          description="Make related tasks, notes, captures, or events."
        >
          <QuickCreateActions
            entityType={entityType}
            entityId={entityId}
            suggestions={createSuggestions}
            onSuggest={handleSuggestCreates}
            isSuggesting={isSuggestingCreates}
          />
        </QuickActionSection>

        <QuickActionSection
          title="Project"
          description="Add this item to an existing project or start a new one."
        >
          <QuickProjectActions
            entityType={entityType}
            entityId={entityId}
            projects={projects}
          />
        </QuickActionSection>

        <QuickActionSection
          title="Tags"
          description="Attach existing tags or create a new one."
          count={attachedTagIds.length + inlineTagIds.length}
        >
          <QuickTagActions
            entityType={entityType}
            entityId={entityId}
            userId={userId}
            tags={tags}
            tagSuggestionText={tagSuggestionText}
            attachedTagIds={attachedTagIds}
            inlineTagIds={inlineTagIds}
            onAttachedTagIdsChange={onAttachedTagIdsChange}
          />
        </QuickActionSection>

        <QuickActionSection
          title="Links"
          description="Connect this item to notes or references."
          count={linkedNoteIds.length + linkedReferenceIds.length}
        >
          <QuickLinkActions
            entityType={entityType}
            entityId={entityId}
            notes={notes}
            references={references}
            tasks={tasks}
            events={events}
            linkedNoteIds={linkedNoteIds}
            linkedReferenceIds={linkedReferenceIds}
            linkedTaskIds={linkedTaskIds}
            linkedEventIds={linkedEventIds}
            linkSuggestions={linkSuggestions}
            onSuggest={handleSuggestLinks}
            isSuggesting={isSuggestingLinks}
            onLinkedNoteIdsChange={onLinkedNoteIdsChange}
            onLinkedReferenceIdsChange={onLinkedReferenceIdsChange}
            onLinkedTaskIdsChange={onLinkedTaskIdsChange}
            onLinkedEventIdsChange={onLinkedEventIdsChange}
          />
        </QuickActionSection>
      </div>
    </aside>
  );
}
