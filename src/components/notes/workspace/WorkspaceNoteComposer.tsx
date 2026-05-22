"use client";

import { useState } from "react";
import { Note, Tag, Reference } from "@/db/schema";
import RichNoteEditor from "@/components/notes/editor/RichNoteEditor";
import { createNoteAction } from "@/app/actions/notes";
import { useRouter } from "next/navigation";
import ReferenceComposer from "@/components/references/ReferenceComposer";
import { extractReferenceIdsFromContentJson } from "@/lib/notes/extractReferenceIdsFromContentJson";

type NewNoteComposerProps = {
  notes: Note[];
  tags: Tag[];
  references: Reference[];
  projectId?: string;
  projectRole?: "source" | "working" | "completed" | "reference";
  heading?: string;
  compact?: boolean;
};

export default function WorkspaceNoteComposer({
  notes,
  tags,
  references,
  projectId,
  projectRole = "working",
  heading = "Create Workspace Card",
  compact = false,
}: NewNoteComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [linkedNoteIds, setLinkedNoteIds] = useState<string[]>([]);
  const [contentJson, setContentJson] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [inlineTagNames, setInlineTagNames] = useState<string[]>([]);
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<string[]>(
    [],
  );
  const [availableReferences, setAvailableReferences] =
    useState<Reference[]>(references);
  const [showReferenceComposer, setShowReferenceComposer] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [showReferences, setShowReferences] = useState(false);
  const [showLinkedCards, setShowLinkedCards] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const inlineReferenceIds = extractReferenceIdsFromContentJson(contentJson);

  const router = useRouter();
  const titleMissing = savedMessage.includes("card title");

  const suggestedTags = tags
    .map((tag) => {
      const name = tag.name.toLowerCase();
      const score =
        (title.toLowerCase().includes(name) ? 3 : 0) +
        (content.toLowerCase().includes(name) ? 2 : 0) +
        (inlineTagNames.includes(tag.name) ? 4 : 0) +
        (selectedTagIds.includes(tag.id) ? 5 : 0);

      return { tag, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ tag }) => tag);

  const visibleTags = showAllTags
    ? tags.filter((tag) =>
        tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
      )
    : suggestedTags.slice(0, 8);

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  }

  function resetComposer() {
    setTitle("");
    setContent("");
    setContentJson("");
    setSelectedTagIds([]);
    setNewTagName("");
    setLinkedNoteIds([]);
    setHasSaved(false);
    setSavedMessage("");
    setInlineTagNames([]);
    setSelectedReferenceIds([]);
    setShowReferenceComposer(false);
    setEditorResetKey((current) => current + 1);
  }

  function toggleLinkedNote(noteId: string) {
    setLinkedNoteIds((current) =>
      current.includes(noteId)
        ? current.filter((id) => id !== noteId)
        : [...current, noteId],
    );
  }

  async function handleSave() {
    if (isSaving || hasSaved) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setSavedMessage("Add a card title before saving.");
      return;
    }

    if (!trimmedContent) {
      setSavedMessage("Add some card content before saving.");
      return;
    }

    const inlineReferenceIds = extractReferenceIdsFromContentJson(contentJson);

    const finalReferenceIds = Array.from(
      new Set([...selectedReferenceIds, ...inlineReferenceIds]),
    );

    try {
      setIsSaving(true);
      setSavedMessage("");

      await createNoteAction({
        title: trimmedTitle,
        content: trimmedContent,
        contentJson,
        selectedTagIds,
        newTagName,
        linkedNoteIds,
        inlineTagNames,
        selectedReferenceIds: finalReferenceIds,
        projectId,
        projectRole,
      });

      setHasSaved(true);
      setSavedMessage("Card saved.");

      router.refresh();
    } catch (error) {
      console.error(error);

      setSavedMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Card was not saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }
  function toggleReference(referenceId: string) {
    setSelectedReferenceIds((current) =>
      current.includes(referenceId)
        ? current.filter((id) => id !== referenceId)
        : [...current, referenceId],
    );
  }
  function getReferenceLabel(reference: Reference) {
    return (
      reference.title?.trim() ||
      reference.author?.trim() ||
      reference.url?.trim() ||
      "Untitled reference"
    );
  }

  return (
    <aside
      className={
        compact
          ? "rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 text-[rgb(var(--text))]"
          : "rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 text-[rgb(var(--text))] shadow-sm"
      }
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-[rgb(var(--muted))]">
          Add the note, choose references, then organize it with tags and linked
          cards.
        </p>
      </div>

      <div className="grid gap-3">
        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[rgb(var(--text))]">
            Note
          </h3>

          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              className={`w-full rounded-xl border px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] ${
                titleMissing
                  ? "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                  : "border-[rgb(var(--border))] bg-[rgb(var(--card))]"
              }`}
            />

            <RichNoteEditor
              key={editorResetKey}
              initialContent={contentJson || content}
              tags={tags}
              references={availableReferences}
              onTagUsed={(tagName) => {
                setInlineTagNames((current) =>
                  current.includes(tagName) ? current : [...current, tagName],
                );
              }}
              onReferenceUsed={(referenceId) => {
                setSelectedReferenceIds((current) =>
                  current.includes(referenceId)
                    ? current
                    : [...current, referenceId],
                );
              }}
              onChange={({ plainText, json }) => {
                setContent(plainText);
                setContentJson(json);
              }}
              getReferenceLabel={getReferenceLabel}
              onReferenceRemoved={() => {}}
              onTagRemoved={(tagName) => {
                setInlineTagNames((current) =>
                  current.filter((name) => name !== tagName),
                );
              }}
              inlineReferenceIds={inlineReferenceIds}
              selectedReferenceIds={selectedReferenceIds}
            />
          </div>
          {savedMessage && (
            <p
              className={`mt-3 text-sm ${
                hasSaved
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {savedMessage}
            </p>
          )}
        </section>

        {/* <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[rgb(var(--text))]">
              References
            </h3>

            <button
              type="button"
              onClick={() => setShowReferenceComposer((current) => !current)}
              className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text))] shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              {showReferenceComposer ? "Hide form" : "+ Reference"}
            </button>
          </div>

          <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2">
            {availableReferences.length > 0 ? (
              availableReferences.map((reference) => {
                const selected = selectedReferenceIds.includes(reference.id);

                return (
                  <button
                    key={reference.id}
                    type="button"
                    onClick={() => toggleReference(reference.id)}
                    className={`block w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selected
                        ? "border-blue-400 bg-blue-100 text-blue-900 shadow-sm dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100"
                        : "border-transparent text-[rgb(var(--text))] hover:border-[rgb(var(--border))] hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="block font-medium">
                      {getReferenceLabel(reference)}
                    </span>

                    {reference.author && (
                      <span className="block text-xs text-[rgb(var(--muted))]">
                        {reference.author}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-[rgb(var(--muted))]">
                No references yet.
              </p>
            )}
          </div>

          {showReferenceComposer && (
            <div className="mt-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
              <ReferenceComposer
                onReferenceCreated={(reference) => {
                  setAvailableReferences((current) => [reference, ...current]);
                  setSelectedReferenceIds((current) =>
                    current.includes(reference.id)
                      ? current
                      : [...current, reference.id],
                  );
                  setShowReferenceComposer(false);
                }}
              />
            </div>
          )}
        </section> */}
      </div>

      <div className="mt-3 space-y-3">
        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--text))]">
                Tags
              </h3>
              <p className="text-xs text-[rgb(var(--muted))]">
                Suggested from title, content, and inline tags.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[rgb(var(--card))] px-2 py-1 text-xs text-[rgb(var(--muted))]">
                {selectedTagIds.length} selected
              </span>

              <button
                type="button"
                onClick={() => setShowAllTags((current) => !current)}
                className="rounded-full border border-[rgb(var(--border))] px-2 py-1 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                {showAllTags ? "Suggested" : "All Tags"}
              </button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {showAllTags && (
              <input
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search tags..."
                className="mb-3 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm"
              />
            )}
            {visibleTags.length > 0 ? (
              visibleTags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? "border-blue-500 bg-blue-100 text-blue-800 shadow-sm dark:bg-blue-900/40 dark:text-blue-200"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-[rgb(var(--muted))]">
                No tag suggestions yet. Start typing and pretend the app is
                psychic.
              </p>
            )}
          </div>

          <input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Create new tag"
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]"
          />
        </section>

        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
          <button
            type="button"
            onClick={() => setShowReferences((current) => !current)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--text))]">
                References
              </h3>
              <p className="text-xs text-[rgb(var(--muted))]">
                {selectedReferenceIds.length} selected
              </p>
            </div>

            <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
              {showReferences ? "Hide" : "Show"}
            </span>
          </button>

          {showReferences && (
            <div className="mt-3 space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowReferenceComposer((current) => !current)
                  }
                  className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text))] shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  {showReferenceComposer ? "Hide form" : "+ Reference"}
                </button>
              </div>

              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2">
                {availableReferences.length > 0 ? (
                  availableReferences.map((reference) => {
                    const selected = selectedReferenceIds.includes(
                      reference.id,
                    );

                    return (
                      <button
                        key={reference.id}
                        type="button"
                        onClick={() => toggleReference(reference.id)}
                        className={`block w-full rounded-lg border px-2 py-1.5 text-left text-xs transition ${
                          selected
                            ? "border-blue-400 bg-blue-100 text-blue-900 shadow-sm dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100"
                            : "border-transparent text-[rgb(var(--text))] hover:border-[rgb(var(--border))] hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="block truncate font-medium">
                          {getReferenceLabel(reference)}
                        </span>

                        {reference.author && (
                          <span className="block truncate text-[11px] text-[rgb(var(--muted))]">
                            {reference.author}
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-[rgb(var(--muted))]">
                    No references yet.
                  </p>
                )}
              </div>

              {showReferenceComposer && (
                <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
                  <ReferenceComposer
                    onReferenceCreated={(reference) => {
                      setAvailableReferences((current) => [
                        reference,
                        ...current,
                      ]);
                      setSelectedReferenceIds((current) =>
                        current.includes(reference.id)
                          ? current
                          : [...current, reference.id],
                      );
                      setShowReferenceComposer(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3">
          <button
            type="button"
            onClick={() => setShowLinkedCards((current) => !current)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--text))]">
                Link Existing Cards
              </h3>
              <p className="text-xs text-[rgb(var(--muted))]">
                {linkedNoteIds.length} selected
              </p>
            </div>

            <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
              {showLinkedCards ? "Hide" : "Show"}
            </span>
          </button>

          {showLinkedCards && (
            <div className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2">
              {notes.length > 0 ? (
                notes.map((note) => {
                  const selected = linkedNoteIds.includes(note.id);

                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => toggleLinkedNote(note.id)}
                      className={`block w-full rounded-lg border px-2 py-1.5 text-left text-xs transition ${
                        selected
                          ? "border-blue-400 bg-blue-100 text-blue-900 shadow-sm dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100"
                          : "border-transparent text-[rgb(var(--text))] hover:border-[rgb(var(--border))] hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="block truncate">{note.title}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-[rgb(var(--muted))]">
                  No cards to link yet.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-start">
        <button
          type="button"
          onClick={resetComposer}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-5 py-2.5 text-sm font-semibold text-[rgb(var(--text))] shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          Clear Form
        </button>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || hasSaved}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
              isSaving || hasSaved
                ? "cursor-not-allowed bg-slate-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? "Saving..." : hasSaved ? "Saved" : "Save Note"}
          </button>
          {savedMessage && (
            <p
              className={`mt-2 px-1 text-sm ${
                hasSaved
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {savedMessage}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
