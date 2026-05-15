"use client";

import { useState } from "react";
import { Note, Tag, Reference } from "@/db/schema";
import RichNoteEditor from "./RichNoteEditor";
import { createNoteAction } from "@/app/actions/notes";
import { useRouter } from "next/navigation";
import ReferenceComposer from "../references/ReferenceComposer";
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

export default function NewNoteComposer({
  notes,
  tags,
  references,
  projectId,
  projectRole = "working",
  heading = "Create New Card",
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

  const inlineReferenceIds = extractReferenceIdsFromContentJson(contentJson);

  const router = useRouter();
  const titleMissing = savedMessage.includes("card title");

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

    if (finalReferenceIds.length === 0) {
      setSavedMessage("Add at least one reference before saving.");
      return;
    }

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
        : "rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 text-[rgb(var(--text))] shadow-sm"
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

    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
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

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
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
      </section>
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[rgb(var(--text))]">
          Tags
        </h3>

        <div className="mb-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2">
          {tags.length > 0 ? (
            tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? "border-blue-500 bg-blue-100 text-blue-800 shadow-sm dark:bg-blue-900/40 dark:text-blue-200"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-[rgb(var(--muted))]">No tags yet.</p>
          )}
        </div>

        <input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Create new tag"
          className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]"
        />
      </section>

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[rgb(var(--text))]">
          Link Existing Cards
        </h3>

        <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2">
          {notes.length > 0 ? (
            notes.map((note) => {
              const selected = linkedNoteIds.includes(note.id);

              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => toggleLinkedNote(note.id)}
                  className={`block w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selected
                      ? "border-blue-400 bg-blue-100 text-blue-900 shadow-sm dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100"
                      : "border-transparent text-[rgb(var(--text))] hover:border-[rgb(var(--border))] hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {note.title}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-[rgb(var(--muted))]">
              No cards to link yet.
            </p>
          )}
        </div>
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
