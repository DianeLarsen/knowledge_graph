"use client";

import { useState } from "react";

import { Note, Tag, Reference } from "@/db/schema";
import RichNoteEditor from "@/components/notes/editor/RichNoteEditor";
import { updateNoteAction } from "@/app/actions/notes";
import ReferenceComposer from "@/components/references/ReferenceComposer";
import { extractReferenceIdsFromContentJson } from "@/lib/notes/extractReferenceIdsFromContentJson";
import type { NoteLinkedReference } from "@/lib/types/references/referenceTypes";
import { colorClassMap } from "@/lib/tagColorClasses";
import { TagColor } from "@/lib/types/tags/tagColors";
import { suggestTagsForNoteAction } from "@/app/actions/tagSuggestions";

type AiSuggestedTag = {
  name: string;
  exists: boolean;
};

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
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<string[]>(
    noteReferences.map((reference) => reference.id),
  );

  const [newTagName, setNewTagName] = useState("");
  const [availableReferences, setAvailableReferences] =
    useState<Reference[]>(references);
  const [showReferenceComposer, setShowReferenceComposer] = useState(false);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(
    noteTags.map((tag) =>
      tag.name
        .trim()
        .replace(/^#+/, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, "")
        .replace(/[\s-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, ""),
    ),
  );
  const [selectedLinkedNoteIds, setSelectedLinkedNoteIds] =
    useState<string[]>(linkedNoteIds);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [aiSuggestedTags, setAiSuggestedTags] = useState<AiSuggestedTag[]>([]);

  function toggleLinkedNote(noteId: string) {
    setSelectedLinkedNoteIds((current) =>
      current.includes(noteId)
        ? current.filter((id) => id !== noteId)
        : [...current, noteId],
    );
  }

  function toggleTag(tagName: string) {
    const normalizedName = normalizeTagName(tagName);

    if (!normalizedName) return;

    setSelectedTagNames((current) => {
      const currentSet = new Set(current.map(normalizeTagName));

      return currentSet.has(normalizedName)
        ? current.filter((name) => normalizeTagName(name) !== normalizedName)
        : [...current, normalizedName];
    });
  }

  const inlineReferenceIds = extractReferenceIdsFromContentJson(contentJson);

  function extractTagNamesFromContentJson(contentJson: string | null) {
    if (!contentJson) return [];

    try {
      const parsed = JSON.parse(contentJson);
      const tagNames = new Set<string>();

      function walk(node: any) {
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === "tagMark" && mark.attrs?.tagName) {
              tagNames.add(mark.attrs.tagName);
            }
          });
        }

        if (node.content) {
          node.content.forEach(walk);
        }
      }

      walk(parsed);

      return Array.from(tagNames);
    } catch {
      return [];
    }
  }

  function getInlineTagNameSet(contentJson: string | null) {
    return new Set(
      extractTagNamesFromContentJson(contentJson).map((name) =>
        name.toLowerCase(),
      ),
    );
  }

  function normalizeTagName(value: string) {
    return value
      .trim()
      .replace(/^#+/, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, "")
      .replace(/[\s-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  async function handleSuggestTags() {
    if (isSuggestingTags) return;

    try {
      setIsSuggestingTags(true);
      setMessage("");

      const result = await suggestTagsForNoteAction({
        title,
        content,
        availableTags: tags.map((tag) => ({ name: tag.name })),
      });

      const existingSuggestions = result.existingTagNames.map((name) => ({
        name: normalizeTagName(name),
        exists: true,
      }));

      const newSuggestions = result.newTagNames.map((name) => ({
        name: normalizeTagName(name),
        exists: false,
      }));

      const suggestions = [...existingSuggestions, ...newSuggestions]
        .filter((tag) => tag.name)
        .filter(
          (tag, index, array) =>
            array.findIndex((item) => item.name === tag.name) === index,
        );

      setAiSuggestedTags(suggestions);
    } catch (error) {
      console.error(error);
      setMessage("Could not suggest tags.");
    } finally {
      setIsSuggestingTags(false);
    }
  }

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

      const inlineTagNamesFromContent =
        extractTagNamesFromContentJson(contentJson);

      const finalTagNames = Array.from(
        new Set(
          [...selectedTagNames, ...inlineTagNamesFromContent]
            .map(normalizeTagName)
            .filter(Boolean),
        ),
      );

      const updatedNote = await updateNoteAction({
        id: note.id,
        title,
        content,
        contentJson,
        inlineTagNames: finalTagNames,
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
    const tagName = normalizeTagName(newTagName);

    if (!tagName) return;

    setSelectedTagNames((current) =>
      current.some((name) => normalizeTagName(name) === tagName)
        ? current
        : [...current, tagName],
    );

    setNewTagName("");
  }

  function addSuggestedTag(tagName: string) {
    const normalizedName = normalizeTagName(tagName);

    if (!normalizedName) return;

    setSelectedTagNames((current) =>
      current.some((name) => normalizeTagName(name) === normalizedName)
        ? current
        : [...current, normalizedName],
    );
  }

  const tagColorMap: Record<string, TagColor> = Object.fromEntries(
    tags.flatMap((tag) => {
      const color = (tag.color ?? "blue") as TagColor;

      return [
        [tag.id, color],
        [tag.name.toLowerCase(), color],
      ];
    }),
  );

  const inlineTagNameSet = new Set(
    extractTagNamesFromContentJson(contentJson).map(normalizeTagName),
  );

  const selectedTagNameSet = new Set(selectedTagNames.map(normalizeTagName));

  const currentTags = tags.filter((tag) =>
    selectedTagNameSet.has(normalizeTagName(tag.name)),
  );
  const selectedNewTagNames = selectedTagNames.filter(
    (tagName) =>
      !tags.some(
        (tag) => normalizeTagName(tag.name) === normalizeTagName(tagName),
      ),
  );
  const otherTags = tags.filter((tag) => {
    const tagName = normalizeTagName(tag.name);

    return !selectedTagNameSet.has(tagName) && !inlineTagNameSet.has(tagName);
  });

  function renderTagButton(
    tag: Tag,
    variant: "current" | "suggested" | "other",
  ) {
    const tagName = normalizeTagName(tag.name);
    const selected = selectedTagNameSet.has(tagName);
    const isInlineLinked = inlineTagNameSet.has(tagName);

    const color = (tag.color ?? "blue") as TagColor;
    const inlineColorClasses = colorClassMap[color].join(" ");

    const currentClasses = isInlineLinked
      ? `border-current ${inlineColorClasses}`
      : "border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-500 dark:bg-blue-900/40 dark:text-blue-200";

    const suggestedClasses =
      "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200";

    const otherClasses =
      "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";

    const className =
      variant === "current"
        ? currentClasses
        : variant === "suggested"
          ? suggestedClasses
          : otherClasses;

    return (
      <button
        key={tag.id}
        type="button"
        onClick={() => toggleTag(tag.name)}
        className={`rounded-full border px-3 py-1 text-sm transition ${className}`}
        title={
          selected
            ? isInlineLinked
              ? "Linked inline and saved on this card"
              : "Saved on this card"
            : variant === "suggested"
              ? "Used inline but not saved as a card tag yet"
              : "Available tag"
        }
      >
        #{tag.name}
      </button>
    );
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
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </p>

          <button
            type="button"
            onClick={handleSuggestTags}
            disabled={isSuggestingTags}
            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            {isSuggestingTags ? "Thinking..." : "Suggest tags"}
          </button>
          <p className="mt-1 text-xs text-gray-400">
            Suggested count: {aiSuggestedTags.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3 dark:border-gray-700 dark:bg-gray-950/40">
          <div className="flex flex-wrap gap-2">
            {currentTags.length > 0 || selectedNewTagNames.length > 0 ? (
              <>
                {currentTags.map((tag) => renderTagButton(tag, "current"))}

                {selectedNewTagNames.map((tagName) => (
                  <button
                    key={`selected-new-${tagName}`}
                    type="button"
                    onClick={() => toggleTag(tagName)}
                    className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                    title="New tag selected for this card"
                  >
                    #{tagName}
                    <span className="ml-1 text-xs opacity-70">new</span>
                  </button>
                ))}
              </>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No tags attached yet.
              </p>
            )}
          </div>

          {aiSuggestedTags.length > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Suggested
              </p>

              <div className="flex flex-wrap gap-2">
                {aiSuggestedTags.map((tag) => {
                  const alreadySelected = selectedTagNameSet.has(
                    normalizeTagName(tag.name),
                  );

                  return (
                    <button
                      key={`${tag.exists ? "existing" : "new"}-${tag.name}`}
                      type="button"
                      onClick={() => addSuggestedTag(tag.name)}
                      disabled={alreadySelected}
                      className={`
                  rounded-full border px-3 py-1 text-xs font-medium transition
                  ${
                    alreadySelected
                      ? "cursor-default border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                      : tag.exists
                        ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                        : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                  }
                `}
                      title={
                        tag.exists
                          ? "Suggested existing tag"
                          : "Suggested new tag"
                      }
                    >
                      #{tag.name}
                      {!tag.exists && (
                        <span className="ml-1 opacity-70">new</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="flex w-44 items-center rounded-full border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-950">
              <span className="text-xs text-gray-400">#</span>

              <input
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCardLevelTag();
                  }
                }}
                placeholder="add tag"
                className="min-w-0 flex-1 bg-transparent px-1 text-xs text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-100"
              />
            </div>

            <button
              type="button"
              onClick={addCardLevelTag}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-200"
            >
              Add
            </button>

            <button
              type="button"
              onClick={() => setShowAllTags((current) => !current)}
              className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
            >
              {showAllTags ? "Hide all" : `Browse all (${otherTags.length})`}
            </button>
          </div>

          {showAllTags && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
              {otherTags.length > 0 ? (
                otherTags.map((tag) => renderTagButton(tag, "other"))
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No other tags available.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Content
      </label>

      <RichNoteEditor
        initialContent={contentJson || content}
        tags={tags}
        references={availableReferences}
        onTagUsed={() => {}}
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
          if (!tagName) return;

          setSelectedTagNames((current) =>
            current.filter(
              (name) => normalizeTagName(name) !== normalizeTagName(tagName),
            ),
          );
        }}
        inlineReferenceIds={inlineReferenceIds}
        selectedReferenceIds={selectedReferenceIds}
        tagColorMap={tagColorMap}
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
