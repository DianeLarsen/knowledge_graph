"use client";

import { useState } from "react";
import WorkspaceNoteComposer from "@/components/notes/workspace/WorkspaceNoteComposer";
import NoteCard from "@/components/notes/card/NoteCard";

import type { NoteDetails } from "@/components/notes/card/noteCardTypes";
import WorkspaceTagPanel from "@/components/notes/workspace/WorkspaceTagPanel";
import NotesList from "@/components/notes/NotesList";
import { Reference, Project } from "@/db/schema";
import {
  saveWorkspaceToProjectAction,
  suggestWorkspaceProjectTitleAction,
} from "@/app/actions/workspace";
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

type DesktopWorkspaceProps = {
  dataList: NoteDetails[];
  references: Reference[];
  projects: Project[];
  userId: string;
};

export default function DesktopNotesWorkspace({
  dataList,
  userId,
  references,
  projects,
}: DesktopWorkspaceProps) {
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [suggestedProjectTitle, setSuggestedProjectTitle] = useState("");
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);

  const notes = getWorkspaceNotes(dataList);
  const noteOptions = getNoteOptions(dataList);
  const tags = getWorkspaceTags(dataList);
  const tagStats = getWorkspaceTagStats(dataList);
  const openNotes = getOpenNotes(dataList, openNoteIds);

  async function handleSaveWorkspaceToProject(formData: FormData) {
    await saveWorkspaceToProjectAction(formData);
    setShowProjectModal(false);
  }

  function toggleNote(noteId: string) {
    setOpenNoteIds((current) =>
      current.includes(noteId)
        ? current.filter((id) => id !== noteId)
        : [...current, noteId],
    );
  }

  function closeNote(noteId: string) {
    setOpenNoteIds((current) => current.filter((id) => id !== noteId));
  }

  function openCardsByTag(tagId: string) {
    const matchingNoteIds = getNoteIdsByTag(dataList, tagId);

    setOpenNoteIds((current) => {
      const allOpen = areAllIdsIncluded(current, matchingNoteIds);

      return allOpen
        ? removeIds(current, matchingNoteIds)
        : addUniqueIds(current, matchingNoteIds);
    });
  }

  function closeAllCards() {
    setOpenNoteIds([]);
  }

  function openNote(noteId: string) {
    setOpenNoteIds((current) =>
      current.includes(noteId) ? current : [...current, noteId],
    );
  }

  function handleOpenProjectModal() {
    setShowProjectModal(true);

    if (!suggestedProjectTitle) {
      setSuggestedProjectTitle("Workspace Project");
    }
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

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] p-2 text-[rgb(var(--text))] sm:p-3 lg:p-4">
      <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_280px] 2xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="space-y-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] pl-3 pr-1 text-[rgb(var(--text))] xl:sticky xl:top-3 xl:max-h-[calc(100vh-1.5rem)] xl:overflow-y-auto">
          <WorkspaceTagPanel
            tags={tags}
            dataList={dataList}
            openNoteIds={openNoteIds}
            tagStats={tagStats}
            onOpenCardsByTag={openCardsByTag}
          />

          <div className="border-t border-[rgb(var(--border))] pt-5">
            <NotesList
              notes={notes}
              openNoteIds={openNoteIds}
              onToggleNote={toggleNote}
            />
          </div>
        </aside>

        <section className="min-w-0 overflow-x-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 text-[rgb(var(--text))] sm:p-3">
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
                  Open Cards
                </h2>
                <p className="text-xs text-[rgb(var(--muted))]">
                  {openNoteIds.length} card{openNoteIds.length === 1 ? "" : "s"}{" "}
                  open
                </p>
              </div>

              <button
                type="button"
                onClick={closeAllCards}
                disabled={openNoteIds.length === 0}
                className="
                  rounded-xl border border-[rgb(var(--border))]
                  bg-[rgb(var(--bg))] px-3 py-1 text-sm
                  text-[rgb(var(--text))] hover:bg-slate-200
                  disabled:cursor-not-allowed disabled:opacity-50
                  dark:hover:bg-slate-800
                "
              >
                Close all
              </button>
            </div>

            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                Save open cards
              </p>

              <div className="grid gap-2 lg:grid-cols-[minmax(180px,1fr)_auto_auto]">
                <select
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  disabled={openNoteIds.length === 0}
                  className="min-w-0 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))]"
                >
                  <option value="">Choose project...</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>

                <form action={handleSaveWorkspaceToProject}>
                  {openNoteIds.map((noteId) => (
                    <input
                      key={noteId}
                      type="hidden"
                      name="noteId"
                      value={noteId}
                    />
                  ))}

                  <input
                    type="hidden"
                    name="projectId"
                    value={selectedProjectId}
                  />
                  <input type="hidden" name="projectRole" value="working" />

                  <button
                    type="submit"
                    disabled={openNoteIds.length === 0 || !selectedProjectId}
                    className="
            w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white
            hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50
            xl:w-auto
          "
                  >
                    Save to project
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleOpenProjectModal}
                  disabled={openNoteIds.length === 0}
                  className="
          w-full rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold
          text-blue-800 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50
          dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900
          xl:w-auto
        "
                >
                  New project
                </button>
              </div>
            </div>
          </div>

          <div
            className="
            grid gap-4
            [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]
          "
          >
            {openNotes.map((data) => (
              <NoteCard
                key={data.note.id}
                data={data}
                compact
                allNotes={noteOptions}
                userTags={tags}
                userReferences={references}
                userId={userId}
                onOpenNote={openNote}
                onClose={() => closeNote(data.note.id)}
              />
            ))}
          </div>
        </section>

        <WorkspaceNoteComposer
          notes={notes}
          tags={tags}
          references={references}
        />
      </div>
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 shadow-xl">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[rgb(var(--text))]">
                Create project from open cards
              </h2>
              <p className="text-sm text-[rgb(var(--muted))]">
                This will create a project and add all currently open notes to
                it.
              </p>
            </div>

            <form action={handleSaveWorkspaceToProject} className="space-y-4">
              {openNoteIds.map((noteId) => (
                <input
                  key={noteId}
                  type="hidden"
                  name="noteId"
                  value={noteId}
                />
              ))}

              <input type="hidden" name="projectRole" value="working" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    Project name
                  </label>

                  <button
                    type="button"
                    onClick={handleSuggestProjectTitle}
                    disabled={isSuggestingTitle}
                    className="
                      rounded-lg border border-purple-300 bg-purple-50 px-2 py-1
                      text-xs font-semibold text-purple-700
                      hover:bg-purple-100
                      disabled:opacity-50
                      dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200
                      dark:hover:bg-purple-900
                    "
                  >
                    {isSuggestingTitle ? "Thinking..." : "Suggest with AI"}
                  </button>
                </div>

                <input
                  name="newProjectTitle"
                  required
                  value={suggestedProjectTitle}
                  onChange={(event) =>
                    setSuggestedProjectTitle(event.target.value)
                  }
                  placeholder="Project name"
                  className="
      w-full rounded-xl border border-[rgb(var(--border))]
      bg-[rgb(var(--bg))] px-3 py-2 text-sm
      text-[rgb(var(--text))]
    "
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                  Open notes
                </label>

                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-2">
                  {openNotes.map((data) => (
                    <p
                      key={data.note.id}
                      className="rounded-lg bg-white px-2 py-1 text-xs text-gray-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      {data.note.title}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Create project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
