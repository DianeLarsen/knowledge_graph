"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Note } from "@/db/schema";
import { ChevronDown, ChevronRight } from "lucide-react";

type NoteListItem = Note & {
  tags: { id: string; name: string }[];
  projects: { id: string; title: string }[];
};

type GroupMode = "none" | "month" | "tag" | "project";

type SearchMode = "content" | "tag";

type NotesListClientProps = {
  notes: NoteListItem[];
};

function sortGroups(
  groups: { label: string; notes: NoteListItem[] }[],
  bottomLabels: string[] = [],
) {
  return [...groups].sort((a, b) => {
    const aBottom = bottomLabels.includes(a.label);
    const bBottom = bottomLabels.includes(b.label);

    if (aBottom && !bBottom) return 1;
    if (!aBottom && bBottom) return -1;

    return a.label.localeCompare(b.label);
  });
}

export default function NotesListClient({ notes }: NotesListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupMode, setGroupMode] = useState<GroupMode>("none");
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>("content");

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter((note) => {
      if (searchMode === "tag") {
        return note.tags.some((tag) => tag.name.toLowerCase().includes(query));
      }

      return (
        note.title.toLowerCase().includes(query) ||
        (note.content ?? "").toLowerCase().includes(query)
      );
    });
  }, [notes, searchQuery, searchMode]);

  const groupedNotes = useMemo(() => {
    if (groupMode === "none") {
      return [{ label: "All Notes", notes: filteredNotes }];
    }

    if (groupMode === "month") {
      const groups = new Map<string, NoteListItem[]>();

      for (const note of filteredNotes) {
        const date = new Date(note.createdAt);
        const label = date.toLocaleString(undefined, {
          month: "long",
          year: "numeric",
        });

        groups.set(label, [...(groups.get(label) ?? []), note]);
      }

      return Array.from(groups.entries()).map(([label, notes]) => ({
        label,
        notes,
      }));
    }

    if (groupMode === "tag") {
      const groups = new Map<string, NoteListItem[]>();

      for (const note of filteredNotes) {
        if (note.tags.length === 0) {
          groups.set("Untagged", [...(groups.get("Untagged") ?? []), note]);
          continue;
        }

        for (const tag of note.tags) {
          groups.set(`#${tag.name}`, [
            ...(groups.get(`#${tag.name}`) ?? []),
            note,
          ]);
        }
      }

      return sortGroups(
        Array.from(groups.entries()).map(([label, notes]) => ({
          label,
          notes,
        })),
        ["Untagged"],
      );
    }

    if (groupMode === "project") {
      const groups = new Map<string, NoteListItem[]>();

      for (const note of filteredNotes) {
        if (note.projects.length === 0) {
          groups.set("No Project", [...(groups.get("No Project") ?? []), note]);
          continue;
        }

        for (const project of note.projects) {
          groups.set(project.title, [
            ...(groups.get(project.title) ?? []),
            note,
          ]);
        }
      }

      return sortGroups(
        Array.from(groups.entries()).map(([label, notes]) => ({
          label,
          notes,
        })),
        ["No Project"],
      );
    }

    return [{ label: "Notes", notes: filteredNotes }];
  }, [filteredNotes, groupMode]);

  const groupLabels = groupedNotes.map((group) => group.label);

  const anyGroupsCollapsed =
    groupMode !== "none" &&
    groupLabels.some((label) => closedGroups.includes(label));

  const anyGroupsOpen =
    groupMode !== "none" &&
    groupLabels.some((label) => !closedGroups.includes(label));

  function toggleGroup(label: string) {
    setClosedGroups((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  }

  function collapseAllGroups() {
    setClosedGroups(groupedNotes.map((group) => group.label));
  }

  function openAllGroups() {
    setClosedGroups([]);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Notes
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your collected notes, because apparently brains need external hard
              drives.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href="/notes/new"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Create Note
            </Link>

            <Link
              href="/references"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              View References
            </Link>
          </div>
        </header>

        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
          />
          <select
            value={searchMode}
            onChange={(event) =>
              setSearchMode(event.target.value as SearchMode)
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="content">Search content</option>
            <option value="tag">Search tags</option>
          </select>
          <select
            value={groupMode}
            onChange={(event) => setGroupMode(event.target.value as GroupMode)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="none">No grouping</option>
            <option value="month">Group by month</option>
            <option value="tag">Group by tag</option>
            <option value="project">Group by project</option>
          </select>
        </div>
        {groupMode !== "none" && groupedNotes.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {anyGroupsCollapsed && (
              <button
                type="button"
                onClick={openAllGroups}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Open all
              </button>
            )}

            {anyGroupsOpen && (
              <button
                type="button"
                onClick={collapseAllGroups}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Collapse all
              </button>
            )}
          </div>
        )}
        {filteredNotes.length > 0 ? (
          <div className="space-y-8">
            {groupedNotes.map((group) => (
              <section key={group.label}>
                {groupMode !== "none" && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="mb-3 flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-2 text-left text-sm font-bold uppercase tracking-wide text-gray-500 shadow-sm hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <span>
                      {group.label}
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs normal-case text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {group.notes.length}
                      </span>
                    </span>

                    {closedGroups.includes(group.label) ? (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                )}

                {!closedGroups.includes(group.label) && (
                  <ul className="grid gap-4">
                    {group.notes.map((note) => (
                      <li
                        key={note.id}
                        className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                      >
                        {note.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {note.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {note.projects.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {note.projects.map((project) => (
                              <span
                                key={project.id}
                                className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                              >
                                {project.title}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link href={`/notes/${note.id}`} className="block">
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400">
                            {note.title}
                          </h3>

                          <p className="mt-2 line-clamp-3 text-gray-600 dark:text-gray-400">
                            {note.content || "No content yet."}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-300 bg-white p-6 text-slate-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            No notes match your search.
          </div>
        )}
      </div>
    </main>
  );
}
