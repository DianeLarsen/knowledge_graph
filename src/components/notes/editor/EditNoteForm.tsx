"use client";

import { useState } from "react";

import EditNoteTagsSection from "@/components/notes/editor/EditNoteTagsSection";
import EditNoteReferencesSection from "@/components/notes/editor/EditNoteReferencesSection";
import EditNoteLinkedCardsSection from "@/components/notes/editor/EditNoteLinkedCardsSection";
import RichNoteEditor from "@/components/notes/editor/RichNoteEditor";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import type { Reference } from "@/db/schema";
import { updateNoteAction } from "@/app/actions/notes";
import { suggestTagsForNoteAction } from "@/app/actions/tagSuggestions";
import { extractReferenceIdsFromContentJson } from "@/lib/notes/extractReferenceIdsFromContentJson";
import {
  buildTagColorMap,
  extractTagNamesFromContentJson,
  normalizeTagName,
  removeInlineTagMarksFromContentJson,
  sameStringSetRaw,
  sameStringSetNormalized,
  getInitialSelectedReferenceIds,
  getInitialSelectedTagNames,
  getInitialInlineTagNames,
  getOtherTags,
  getCurrentTags,
  getSelectedNewTagNames,
  buildAiSuggestedTags,
  getFinalReferenceIds,
  getFinalTagNames,
} from "@/components/notes/editor/utils/editNoteFormUtils";
import type {AiSuggestedTag, EditNoteFormProps} from "./editorTypes";


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
  getInitialSelectedReferenceIds(noteReferences),
);

  const [newTagName, setNewTagName] = useState("");
  const [availableReferences, setAvailableReferences] =
    useState<Reference[]>(references);
  const [showReferenceComposer, setShowReferenceComposer] = useState(false);
const [selectedTagNames, setSelectedTagNames] = useState<string[]>(
  getInitialSelectedTagNames(noteTags),
);
  const [selectedLinkedNoteIds, setSelectedLinkedNoteIds] =
    useState<string[]>(linkedNoteIds);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [aiSuggestedTags, setAiSuggestedTags] = useState<AiSuggestedTag[]>([]);

const [inlineTagNames, setInlineTagNames] = useState<string[]>(
  getInitialInlineTagNames(note.contentJson ?? ""),
);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const hasUnsavedChanges =
    title !== note.title ||
    content !== (note.content ?? "") ||
    contentJson !== (note.contentJson ?? "") ||
    !sameStringSetRaw(
      selectedReferenceIds,
      noteReferences.map((reference) => reference.id),
    ) ||
    !sameStringSetRaw(selectedLinkedNoteIds, linkedNoteIds) ||
    !sameStringSetNormalized(
      selectedTagNames,
      noteTags.map((tag) => tag.name),
      normalizeTagName,
    );

  function handleCancelEdit() {
    if (!onCancel) return;

    if (!hasUnsavedChanges) {
      onCancel();
      return;
    }

    openConfirmDialog({
      title: "Discard changes?",
      message:
        "You have unsaved changes. Keep editing, or discard your changes and close?",
      confirmLabel: "Discard changes",
      cancelLabel: "Keep editing",
      variant: "danger",
      onConfirm: () => {
        onCancel();
      },
    });
  }

  function openConfirmDialog({
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant = "default",
    onConfirm,
    onCancel,
  }: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
    onCancel?: () => void;
  }) {
    setConfirmDialog({
      title,
      message,
      confirmLabel,
      cancelLabel,
      variant,
      onConfirm,
      onCancel,
    });
  }

  function toggleLinkedNote(noteId: string) {
    setSelectedLinkedNoteIds((current) =>
      current.includes(noteId)
        ? current.filter((id) => id !== noteId)
        : [...current, noteId],
    );
  }

  function toggleTag(tagName: string) {
    const normalizedName = normalizeTagName(tagName);
    console.log("Toggling tag:", tagName, "Normalized:", normalizedName);
    if (!normalizedName) return;

    const isSelected = selectedTagNameSet.has(normalizedName);
    console.log("Is selected:", isSelected);
    const isInlineLinked = inlineTagNameSet.has(normalizedName);
    console.log("set of names after click:", Array.from(inlineTagNameSet));
    console.log("Is inline linked:", isInlineLinked);

    if (isSelected && isInlineLinked) {
      openConfirmDialog({
        title: "Remove inline tag?",
        message: `#${normalizedName} is used inside the note text.\n\nRemove the tagged text completely, or keep the text and only remove the tag connection?`,
        confirmLabel: "Remove text",
        cancelLabel: "Keep text",
        variant: "danger",
        onConfirm: () => {
          const updatedContentJson = removeInlineTagMarksFromContentJson({
            contentJson,
            tagName: normalizedName,
            mode: "removeText",
          });

          setContentJson(updatedContentJson);

          const updatedInlineTagNames =
            extractTagNamesFromContentJson(updatedContentJson).map(
              normalizeTagName,
            );

          setInlineTagNames(updatedInlineTagNames);

          setSelectedTagNames((current) =>
            current.filter((name) => normalizeTagName(name) !== normalizedName),
          );

          setMessage(
            `Removed tagged text and detached #${normalizedName}. Save the note to keep this change.`,
          );
        },
        onCancel: () => {
          const updatedContentJson = removeInlineTagMarksFromContentJson({
            contentJson,
            tagName: normalizedName,
            mode: "keepText",
          });

          setContentJson(updatedContentJson);

          const updatedInlineTagNames =
            extractTagNamesFromContentJson(updatedContentJson).map(
              normalizeTagName,
            );

          setInlineTagNames(updatedInlineTagNames);

          setSelectedTagNames((current) =>
            current.filter((name) => normalizeTagName(name) !== normalizedName),
          );

          setMessage(
            `Removed inline #${normalizedName} but kept the text. Save the note to keep this change.`,
          );
        },
      });

      return;
    }

    setSelectedTagNames((current) => {
      const currentSet = new Set(current.map(normalizeTagName));

      return currentSet.has(normalizedName)
        ? current.filter((name) => normalizeTagName(name) !== normalizedName)
        : [...current, normalizedName];
    });
  }

  const inlineReferenceIds = extractReferenceIdsFromContentJson(contentJson);

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

      setAiSuggestedTags(
        buildAiSuggestedTags({
          existingTagNames: result.existingTagNames,
          newTagNames: result.newTagNames,
        }),
      );
    } catch (error) {
      console.error(error);
      setMessage("Could not suggest tags.");
    } finally {
      setIsSuggestingTags(false);
    }
  }

async function handleSave() {
  if (isSaving) return;

  const finalReferenceIds = getFinalReferenceIds({
    selectedReferenceIds,
    inlineReferenceIds,
  });

  if (finalReferenceIds.length === 0) {
    setMessage("Add at least one reference before saving.");
    return;
  }

  try {
    setIsSaving(true);
    setMessage("");

    const finalTagNames = getFinalTagNames({
      selectedTagNames,
      contentJson,
    });

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

  const tagColorMap = buildTagColorMap(tags);

  const selectedTagNameSet = new Set(selectedTagNames.map(normalizeTagName));
  const inlineTagNameSet = new Set(inlineTagNames.map(normalizeTagName));

  const currentTags = getCurrentTags({ tags, selectedTagNames });
  const selectedNewTagNames = getSelectedNewTagNames({
    tags,
    selectedTagNames,
  });
  const otherTags = getOtherTags({ tags, selectedTagNames, inlineTagNames });

  return (
    <section
      className="
    mx-auto max-w-3xl rounded-2xl
    border border-[rgb(var(--border))]
    bg-[rgb(var(--card))]
    p-6 shadow-md
  "
    >
      <div className="relative">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Edit Note
        </h1>
        {onCancel && (
          <button
            type="button"
            onClick={handleCancelEdit}
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
      <label className="mb-2 block text-sm font-medium text-[rgb(var(--muted-text))]">
        Title
      </label>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="
    mb-4 w-full rounded-xl
    border border-[rgb(var(--border))]
    bg-[rgb(var(--input))]
    px-3 py-2
    text-[rgb(var(--text))]
    placeholder:text-[rgb(var(--soft-text))]
    outline-none
    focus:border-[rgb(var(--border-strong))]
    focus:ring-2 focus:ring-[rgb(var(--border))]
  "
      />
      <EditNoteTagsSection
        tags={tags}
        currentTags={currentTags}
        selectedNewTagNames={selectedNewTagNames}
        otherTags={otherTags}
        aiSuggestedTags={aiSuggestedTags}
        selectedTagNameSet={selectedTagNameSet}
        inlineTagNameSet={inlineTagNameSet}
        showAllTags={showAllTags}
        isSuggestingTags={isSuggestingTags}
        onNewTagNameChange={setNewTagName}
        onAddCardLevelTag={addCardLevelTag}
        onAddSuggestedTag={addSuggestedTag}
        onToggleShowAllTags={() => setShowAllTags((current) => !current)}
        onSuggestTags={handleSuggestTags}
        normalizeTagName={normalizeTagName}
        handleToggleTag={toggleTag}
      />
      <label className="mb-2 block text-sm font-medium text-[rgb(var(--muted-text))]">
        Content
      </label>

      <RichNoteEditor
        initialContent={contentJson || content}
        tags={tags}
        references={availableReferences}
        onTagUsed={(tagName) => {
          const normalizedName = normalizeTagName(tagName);

          if (!normalizedName) return;

          setSelectedTagNames((current) =>
            current.some((name) => normalizeTagName(name) === normalizedName)
              ? current
              : [...current, normalizedName],
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

          const nextInlineTagNames =
            extractTagNamesFromContentJson(json).map(normalizeTagName);

          const previousInlineSet = new Set(
            inlineTagNames.map(normalizeTagName),
          );
          const nextInlineSet = new Set(nextInlineTagNames);

          const removedInlineTags = Array.from(previousInlineSet).filter(
            (tagName) => tagName && !nextInlineSet.has(tagName),
          );

          setInlineTagNames(nextInlineTagNames);

          setSelectedTagNames((current) => {
            const nextSelected = new Set(current.map(normalizeTagName));

            nextInlineTagNames.forEach((tagName) => {
              if (tagName) {
                nextSelected.add(tagName);
              }
            });

            return Array.from(nextSelected);
          });

          const removableTag = removedInlineTags.find((tagName) =>
            selectedTagNameSet.has(tagName),
          );

          if (removableTag) {
            openConfirmDialog({
              title: "Remove tag from note?",
              message: `No other text is tagged with #${removableTag}.\n\nRemove #${removableTag} from this note's tag list too?`,
              confirmLabel: "Remove tag",
              cancelLabel: "Keep tag",
              variant: "danger",
              onConfirm: () => {
                setSelectedTagNames((current) =>
                  current.filter(
                    (name) => normalizeTagName(name) !== removableTag,
                  ),
                );

                setMessage(
                  `Removed #${removableTag} from this note's tag list. Save the note to keep this change.`,
                );
              },
            });
          }
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
        openConfirmDialog={openConfirmDialog}
      />
      <EditNoteReferencesSection
        references={availableReferences}
        selectedReferenceIds={selectedReferenceIds}
        showReferenceComposer={showReferenceComposer}
        onToggleReference={toggleReference}
        onToggleReferenceComposer={() =>
          setShowReferenceComposer((current) => !current)
        }
        onReferenceCreated={(reference) => {
          setAvailableReferences((current) => [reference, ...current]);
          setSelectedReferenceIds((current) =>
            current.includes(reference.id)
              ? current
              : [...current, reference.id],
          );
          setShowReferenceComposer(false);
        }}
        inlineReferenceIds={inlineReferenceIds}
      />

      <EditNoteLinkedCardsSection
        currentNoteId={note.id}
        availableNotes={availableNotes}
        selectedLinkedNoteIds={selectedLinkedNoteIds}
        onToggleLinkedNote={toggleLinkedNote}
      />

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
          onClick={handleCancelEdit}
          className="
  px-3 py-1.5 text-sm
  text-[rgb(var(--muted-text))]
  hover:text-[rgb(var(--text))]
"
        >
          Cancel
        </button>
      )}
      {message && (
        <p className="mt-2 text-sm text-[rgb(var(--muted-text))]">{message}</p>
      )}
      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title ?? ""}
        message={confirmDialog?.message ?? ""}
        confirmLabel={confirmDialog?.confirmLabel}
        cancelLabel={confirmDialog?.cancelLabel}
        variant={confirmDialog?.variant}
        onCancel={() => {
          confirmDialog?.onCancel?.();
          setConfirmDialog(null);
        }}
        onConfirm={() => {
          confirmDialog?.onConfirm();
          setConfirmDialog(null);
        }}
      />
    </section>
  );
}
