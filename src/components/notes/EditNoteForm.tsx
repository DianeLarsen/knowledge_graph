"use client";

import { useState } from "react";

import { Note, Tag, Reference } from "@/db/schema";
import RichNoteEditor from "@/components/notes/RichNoteEditor";
import { updateNoteAction } from "@/app/actions/notes";
import ReferenceComposer from "@/components/references/ReferenceComposer";
import { extractReferenceIdsFromContentJson } from "@/lib/notes/extractReferenceIdsFromContentJson";
import type { NoteLinkedReference } from "@/lib/types/references/referenceTypes";

type LinkedNoteSummary = {
  id: string;
  title: string;
};

type EditNoteFormProps = {
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

export default function EditNoteForm({
  note,
  tags,
  noteTags,
  references,
  noteReferences,
  onCancel,
  onSave,
  availableNotes,
  linkedNoteIds,
}: EditNoteFormProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? "");
  const [contentJson, setContentJson] = useState(note.contentJson ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [inlineTagNames, setInlineTagNames] = useState<string[]>([]);
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<string[]>(
    noteReferences.map((reference) => reference.id),
  );
  const [newTagName, setNewTagName] = useState("");
  const [availableReferences, setAvailableReferences] =
    useState<Reference[]>(references);
  const [showReferenceComposer, setShowReferenceComposer] = useState(false);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(
    noteTags.map((tag) => tag.name),
  );
  const [selectedLinkedNoteIds, setSelectedLinkedNoteIds] =
    useState<string[]>(linkedNoteIds);

  function toggleLinkedNote(noteId: string) {
    setSelectedLinkedNoteIds((current) =>
      current.includes(noteId)
        ? current.filter((id) => id !== noteId)
        : [...current, noteId],
    );
  }

  function toggleTag(tagName: string) {
    setSelectedTagNames((current) =>
      current.includes(tagName)
        ? current.filter((name) => name !== tagName)
        : [...current, tagName],
    );
  }
  const inlineReferenceIds = extractReferenceIdsFromContentJson(contentJson);
  async function handleSave() {
    if (isSaving) return;

    const finalReferenceIds = Array.from(
      new Set([...selectedReferenceIds, ...inlineReferenceIds]),
    );

    if (finalReferenceIds.length === 0) {
      setMessage("Add at least one reference before saving.");
      return;
    }
    try {
      setIsSaving(true);
      setMessage("");

      const updatedNote = await updateNoteAction({
        id: note.id,
        title,
        content,
        contentJson,
        inlineTagNames: Array.from(
          new Set([...selectedTagNames, ...inlineTagNames]),
        ),
        selectedReferenceIds: finalReferenceIds,
        linkedNoteIds: selectedLinkedNoteIds,
      });

      if (updatedNote) {
        onSave?.(updatedNote);
      }

      setMessage("Note saved.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Note was not saved.");
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

  function addCardLevelTag() {
    const tagName = newTagName.trim().replace(/^#/, "").toLowerCase();

    if (!tagName) return;

    setSelectedTagNames((current) =>
      current.includes(tagName) ? current : [...current, tagName],
    );

    setInlineTagNames((current) =>
      current.includes(tagName) ? current : [...current, tagName],
    );

    setNewTagName("");
  }
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="relative">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Edit Note
        </h1>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="
      absolute right-2 top-2 z-10
      rounded-full border border-gray-300 bg-white px-2 py-0.5
      text-xs text-gray-600 shadow-sm transition
      hover:border-red-400 hover:bg-red-50 hover:text-red-600
      dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
      dark:hover:border-red-400 dark:hover:bg-red-900/40
    "
          >
            ×
          </button>
        )}
      </div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Title
      </label>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full rounded-xl border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />
      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Tags
        </p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = selectedTagNames.includes(tag.name);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  selected
                    ? "border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-500 dark:bg-blue-900/40 dark:text-blue-200"
                    : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCardLevelTag();
              }
            }}
            placeholder="Add new card tag"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />

          <button
            type="button"
            onClick={addCardLevelTag}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Add tag
          </button>
        </div>
      </div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Content
      </label>

      <RichNoteEditor
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
            current.includes(referenceId) ? current : [...current, referenceId],
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
      <section className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          References
        </h3>

        <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
          {availableReferences.length > 0 ? (
            availableReferences.map((reference) => {
              const selected = selectedReferenceIds.includes(reference.id);

              return (
                <button
                  key={reference.id}
                  type="button"
                  onClick={() => toggleReference(reference.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                    selected
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="block font-medium">{reference.title}</span>
                  {reference.author && (
                    <span className="block text-xs opacity-75">
                      {reference.author}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No references yet.
            </p>
          )}
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowReferenceComposer((current) => !current)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {showReferenceComposer
              ? "Hide new reference form"
              : "Add new reference"}
          </button>

          {showReferenceComposer && (
            <div className="mt-3">
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
        </div>
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Linked Cards
          </h3>

          <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
            {availableNotes.filter((item) => item.id !== note.id).length > 0 ? (
              availableNotes
                .filter((item) => item.id !== note.id)
                .map((linkedNote) => {
                  const selected = selectedLinkedNoteIds.includes(
                    linkedNote.id,
                  );

                  return (
                    <button
                      key={linkedNote.id}
                      type="button"
                      onClick={() => toggleLinkedNote(linkedNote.id)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selected
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      {linkedNote.title}
                    </button>
                  );
                })
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No other cards available to link.
              </p>
            )}
          </div>
        </section>
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="
    px-3 py-1.5 text-sm
    text-gray-500 hover:text-gray-700
    dark:text-gray-400 dark:hover:text-gray-200
  "
        >
          Cancel
        </button>
      )}
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </section>
  );
}
