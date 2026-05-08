// src/components/shared/PageQuickActions.tsx

"use client";

import { useState } from "react";
import {
  Plus,
  CheckSquare,
  Zap,
  LinkIcon,
  Tags,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type QuickTag = {
  id: string;
  name: string;
};

type QuickReference = {
  id: string;
  title: string;
  type: string;
};

type QuickNote = {
  id: string;
  title: string;
};

type PageQuickActionsProps = {
  entityType: "note" | "task" | "event" | "capture" | "reference";
  entityId: string;
  userId: string;
  tags: QuickTag[];
  references?: QuickReference[];
  notes?: QuickNote[];
};

export default function PageQuickActions({
  entityType,
  entityId,
  tags,
  references = [],
  notes = [],
}: PageQuickActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-6 lg:h-fit">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between text-left lg:hidden"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Quick actions
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <div className={`${open ? "mt-4 block" : "hidden"} space-y-4 lg:block`}>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Create
          </p>

          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <CheckSquare size={16} />
              Task from this {entityType}
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <Zap size={16} />
              Capture follow-up
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <Plus size={16} />
              New linked note
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <Tags size={14} />
            Tags
          </p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className="rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No tags yet.</p>
          )}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <LinkIcon size={14} />
            Link existing
          </p>

          <div className="space-y-2">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950">
              <option value="">Choose note...</option>
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>

            <select className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950">
              <option value="">Choose reference...</option>
              {references.map((reference) => (
                <option key={reference.id} value={reference.id}>
                  {reference.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <input type="hidden" value={entityId} readOnly />
      </div>
    </aside>
  );
}
