"use client";

import { useState } from "react";
import { Search, X, Tags, List, Plus } from "lucide-react";
import NoteCard from "@/components/notes/card/NoteCard";
import type { NoteDetails } from "@/components/notes/card/noteCardTypes";
import { Reference, Project } from "@/db/schema";
import {
  saveWorkspaceToProjectAction,
  suggestWorkspaceProjectTitleAction,
} from "@/app/actions/workspace";
import WorkspaceNoteComposer from "@/components/notes/workspace/WorkspaceNoteComposer";
import WorkspaceTagPanel from "@/components/notes/workspace/WorkspaceTagPanel";
import {
  addUniqueIds,
  getNoteIdsByTag,
  getNoteOptions,
  getOpenNotes,
  getWorkspaceNotes,
  getWorkspaceTags,
  getWorkspaceTagStats,
  removeIds,
  areAllIdsIncluded,
} from "@/components/notes/workspace/workspaceUtils";

type WorkspaceProps = {
  dataList: NoteDetails[];
  references: Reference[];
  projects: Project[];
  userId: string;
};

export default function MobileNotesWorkspace({
  dataList,
  userId,
  references,
  projects,
}: WorkspaceProps) {
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showNotePicker, setShowNotePicker] = useState(true);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [suggestedProjectTitle, setSuggestedProjectTitle] =
    useState("Workspace Project");
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [showTagsPanel, setShowTagsPanel] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const notes = getWorkspaceNotes(dataList);
  const noteOptions = getNoteOptions(dataList);
  const tags = getWorkspaceTags(dataList);
  const tagStats = getWorkspaceTagStats(dataList);
  const openNotes = getOpenNotes(dataList, openNoteIds);

  const filteredData = dataList.filter((data) => {
    const search = searchText.toLowerCase();

    return (
      data.note.title.toLowerCase().includes(search) ||
      data.note.content?.toLowerCase().includes(search)
    );
  });

  function openNote(noteId: string) {
    setOpenNoteIds((current) =>
      current.includes(noteId) ? current : [...current, noteId],
    );
    setShowNotePicker(false);
  }

  function closeNote(noteId: string) {
    setOpenNoteIds((current) => current.filter((id) => id !== noteId));
  }

  async function handleSaveWorkspaceToProject(formData: FormData) {
    await saveWorkspaceToProjectAction(formData);
    setShowSavePanel(false);
  }

  async function handleSuggestProjectTitle() {
    setIsSuggestingTitle(true);

    try {
      const formData = new FormData();

      openNotes.forEach((data) => {
        formData.append(
          "note",
          `Title: ${data.note.title}\nContent: ${data.note.content ?? ""}`,
        );
      });

      const title = await suggestWorkspaceProjectTitleAction(formData);
      setSuggestedProjectTitle(title);
    } finally {
      setIsSuggestingTitle(false);
    }
  }

  function openCardsByTag(tagId: string) {
    const matchingNoteIds = getNoteIdsByTag(dataList, tagId);

    setOpenNoteIds((current) => {
      const allOpen = areAllIdsIncluded(current, matchingNoteIds);

      return allOpen
        ? removeIds(current, matchingNoteIds)
        : addUniqueIds(current, matchingNoteIds);
    });

    setShowTagsPanel(false);
    setShowNotePicker(false);
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] pb-24 text-[rgb(var(--text))]">
      <header className="sticky top-0 z-30 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold">Workspace</h1>
            <p className="text-xs text-[rgb(var(--muted))]">
              {openNoteIds.length} open
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSavePanel(true)}
            disabled={openNoteIds.length === 0}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2">
          <Search className="h-4 w-4 text-[rgb(var(--muted))]" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search notes..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </header>

      <section className="p-3">
        {showNotePicker ? (
          <div className="space-y-2">
            {filteredData.map((data) => {
              const isOpen = openNoteIds.includes(data.note.id);

              return (
                <button
                  key={data.note.id}
                  type="button"
                  onClick={() => openNote(data.note.id)}
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {data.note.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-[rgb(var(--muted))]">
                        {data.note.content}
                      </p>
                    </div>

                    {isOpen && (
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                        Open
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : openNotes.length > 0 ? (
          <div className="space-y-3">
            {openNotes.map((data) => (
              <NoteCard
                key={data.note.id}
                data={data}
                compact
                compactTagLimit={3}
                allNotes={noteOptions}
                userTags={tags}
                userReferences={references}
                userId={userId}
                onOpenNote={openNote}
                onClose={() => closeNote(data.note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 text-center text-sm text-[rgb(var(--muted))]">
            No open notes. Tap Notes and open something, because apparently the
            machine cannot read minds yet.
          </div>
        )}
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2">
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setShowNotePicker(true)}
            className="flex flex-col items-center rounded-xl border border-[rgb(var(--border))] px-2 py-2 text-xs"
          >
            <List className="mb-1 h-4 w-4" />
            Notes
          </button>

          <button
            type="button"
            disabled={openNotes.length === 0}
            onClick={() => setShowNotePicker(false)}
            className="flex flex-col items-center rounded-xl border border-[rgb(var(--border))] px-2 py-2 text-xs disabled:opacity-50"
          >
            <Tags className="mb-1 h-4 w-4" />
            Active
          </button>

          <button
            type="button"
            onClick={() => setShowTagsPanel(true)}
            className="flex flex-col items-center rounded-xl border border-[rgb(var(--border))] px-2 py-2 text-xs"
          >
            <Tags className="mb-1 h-4 w-4" />
            Tags
          </button>

          <button
            type="button"
            onClick={() => setShowComposer(true)}
            className="flex flex-col items-center rounded-xl border border-[rgb(var(--border))] px-2 py-2 text-xs"
          >
            <Plus className="mb-1 h-4 w-4" />
            New
          </button>
        </div>
      </nav>
      {showTagsPanel && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Tags</h2>
                <p className="text-xs text-[rgb(var(--muted))]">
                  Open cards by tag.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTagsPanel(false)}
                className="rounded-full border border-[rgb(var(--border))] p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <WorkspaceTagPanel
              tags={tags}
              dataList={dataList}
              openNoteIds={openNoteIds}
              tagStats={tagStats}
              onOpenCardsByTag={openCardsByTag}
            />
          </div>
        </div>
      )}
      {showComposer && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">New card</h2>
                <p className="text-xs text-[rgb(var(--muted))]">
                  Create a workspace note.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="rounded-full border border-[rgb(var(--border))] p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <WorkspaceNoteComposer
              notes={notes}
              tags={tags}
              references={references}
              compact
              heading="New Card"
            />
          </div>
        </div>
      )}
      {showSavePanel && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Save open notes</h2>
                <p className="text-xs text-[rgb(var(--muted))]">
                  Add {openNoteIds.length} note
                  {openNoteIds.length === 1 ? "" : "s"} to a project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSavePanel(false)}
                className="rounded-full border border-[rgb(var(--border))] p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={handleSaveWorkspaceToProject} className="space-y-3">
              {openNoteIds.map((noteId) => (
                <input
                  key={noteId}
                  type="hidden"
                  name="noteId"
                  value={noteId}
                />
              ))}

              <input type="hidden" name="projectRole" value="working" />

              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm"
              >
                <option value="">Choose existing project...</option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>

              <input type="hidden" name="projectId" value={selectedProjectId} />

              <button
                type="submit"
                disabled={!selectedProjectId}
                className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Save to existing project
              </button>
            </form>

            <div className="my-4 border-t border-[rgb(var(--border))]" />

            <form action={handleSaveWorkspaceToProject} className="space-y-3">
              {openNoteIds.map((noteId) => (
                <input
                  key={noteId}
                  type="hidden"
                  name="noteId"
                  value={noteId}
                />
              ))}

              <input type="hidden" name="projectRole" value="working" />

              <div className="flex gap-2">
                <input
                  name="newProjectTitle"
                  required
                  value={suggestedProjectTitle}
                  onChange={(event) =>
                    setSuggestedProjectTitle(event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm"
                />

                <button
                  type="button"
                  onClick={handleSuggestProjectTitle}
                  disabled={isSuggestingTitle}
                  className="rounded-xl border border-purple-300 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 disabled:opacity-50 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200"
                >
                  AI
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white"
              >
                Create new project
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
