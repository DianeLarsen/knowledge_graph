"use client";

import type React from "react";
import type { Tag, Reference } from "@/db/schema";
import type {
  ContextMenuReference,
  ContextMenuState,
  ContextMenuTag,
  ContextMenuNoteLink,
  LinkedNoteSummary,
} from "@/components/notes/editor/editorTypes";
import { useState } from "react";
import { Search } from "lucide-react";

type RichNoteContextMenuProps = {
  menuRef: React.RefObject<HTMLDivElement | null>;
  contextMenu: NonNullable<ContextMenuState>;
  selectedText: string;
  tags: Tag[];
  references: Reference[];
  selectedReferenceIds: string[];
  inlineReferenceIds: string[];
  hasRemoveActions: boolean;
  getReferenceLabel: (reference: Reference) => string;
  onHighlightSelection: () => void;
  onCreateTagFromSelection: () => void;
  onTagSelection: (tag: Tag) => void;
  onLinkSelectionToReference: (reference: Reference) => void;
  onRemoveTag: (tag: ContextMenuTag) => void;
  onRemoveReference: (reference: ContextMenuReference) => void;
  onRemoveReferenceEverywhere: (reference: ContextMenuReference) => void;
  availableNotes: LinkedNoteSummary[];
  onLinkSelectionToNote: (note: LinkedNoteSummary) => void;
  onRemoveNoteLink: (noteLink: ContextMenuNoteLink) => void;
};

export default function RichNoteContextMenu({
  menuRef,
  contextMenu,
  selectedText,
  tags,
  references,
  selectedReferenceIds,
  inlineReferenceIds,
  hasRemoveActions,
  getReferenceLabel,
  onHighlightSelection,
  onCreateTagFromSelection,
  onTagSelection,
  onLinkSelectionToReference,
  onRemoveTag,
  onRemoveReference,
  onRemoveReferenceEverywhere,
  availableNotes,
  onLinkSelectionToNote,
  onRemoveNoteLink,
}: RichNoteContextMenuProps) {
  const [openSections, setOpenSections] = useState({
    tags: false,
    references: false,
    notes: false,
  });
  const [referenceSearch, setReferenceSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const [noteSearch, setNoteSearch] = useState("");
  function toggleSection(section: keyof typeof openSections) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  const filteredNotes = availableNotes.filter((note) =>
    note.title.toLowerCase().includes(noteSearch.toLowerCase()),
  );

  const filteredReferences = references.filter((reference) => {
    const label = getReferenceLabel(reference).toLowerCase();

    return label.includes(referenceSearch.toLowerCase());
  });
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  function SectionHeader({
    section,
    label,
    count,
  }: {
    section: keyof typeof openSections;
    label: string;
    count?: number;
  }) {
    return (
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <span>
          {label}
          {typeof count === "number" ? ` (${count})` : ""}
        </span>

        <span>{openSections[section] ? "▾" : "▸"}</span>
      </button>
    );
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] flex max-h-[80vh] w-64 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        Selected:{" "}
        <span className="font-semibold">
          {selectedText.length > 40
            ? `${selectedText.slice(0, 40)}...`
            : selectedText}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {hasRemoveActions && (
          <div className="mb-2 border-b border-gray-200 pb-2 dark:border-gray-700">
            <p className="px-3 pb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Existing inline connections
            </p>

            {contextMenu.tags.map((tag) => (
              <button
                key={tag.tagId || tag.tagName}
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="block w-full rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                Remove tag {tag.tagName ? `#${tag.tagName}` : ""}
              </button>
            ))}
            {contextMenu.noteLinks.map((noteLink) => (
              <button
                key={noteLink.noteId || noteLink.noteTitle}
                type="button"
                onClick={() => onRemoveNoteLink(noteLink)}
                className="block w-full rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                Remove note link{" "}
                {noteLink.noteTitle ? `(${noteLink.noteTitle})` : ""}
              </button>
            ))}
            {contextMenu.references.map((reference) => (
              <div
                key={reference.referenceId || reference.referenceTitle}
                className="rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => onRemoveReference(reference)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  Remove reference:{" "}
                  {reference.referenceTitle
                    ? `(${reference.referenceTitle})`
                    : ""}{" "}
                  from selected text: (
                  {selectedText.length > 40
                    ? `${selectedText.slice(0, 40)}...`
                    : selectedText}
                  )
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveReferenceEverywhere(reference)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-red-800 hover:bg-red-100 dark:text-red-200 dark:hover:bg-red-900/40"
                >
                  Remove reference:{" "}
                  {reference.referenceTitle
                    ? `(${reference.referenceTitle})`
                    : ""}{" "}
                  from all linked text in this note
                </button>
              </div>
            ))}
          </div>
        )}

        {contextMenu.mode !== "removeOnly" && (
          <>
            <p className="px-3 pb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Actions
            </p>

            <button
              type="button"
              onClick={onHighlightSelection}
              className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Highlight selected text
            </button>

            {selectedText && (
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onCreateTagFromSelection();
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Create tag: #
                {selectedText.trim().replace(/^#/, "").toLowerCase()}
              </button>
            )}

            {tags.length > 0 && (
              <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                <SectionHeader
                  section="tags"
                  label={
                    contextMenu.hasTagMark ? "Change tag" : "Tag selected text"
                  }
                  count={
                    tags.filter(
                      (tag) =>
                        !contextMenu.tags.some(
                          (inlineTag) =>
                            inlineTag.tagId === tag.id ||
                            inlineTag.tagName === tag.name,
                        ),
                    ).length
                  }
                />
                {openSections.tags && (
                  <div className="max-h-32 overflow-y-auto pr-1">
                    <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-1 dark:bg-gray-900">
                      <div className="relative">
                        <Search
                          className="
        pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5
        -translate-y-1/2 text-gray-400
      "
                        />

                        <label htmlFor="tag-search" className="sr-only">
                          Search tags
                        </label>

                        <input
                          type="text"
                          value={tagSearch}
                          onChange={(event) => setTagSearch(event.target.value)}
                          placeholder="Search tags..."
                          id="tag-search"
                          className="
        w-full rounded-lg border border-gray-300 bg-white
        py-1.5 pl-7 pr-2
        text-xs text-gray-800 outline-none
        placeholder:text-gray-400
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100
        dark:placeholder:text-gray-500
        dark:focus:border-blue-500 dark:focus:ring-blue-900/40
      "
                        />
                      </div>
                    </div>
                    {filteredTags
                      .filter(
                        (tag) =>
                          !contextMenu.tags.some(
                            (inlineTag) =>
                              inlineTag.tagId === tag.id ||
                              inlineTag.tagName === tag.name,
                          ),
                      )
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            onTagSelection(tag);
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                        >
                          #{tag.name}
                        </button>
                      ))}

                    {tags.every((tag) =>
                      contextMenu.tags.some(
                        (inlineTag) =>
                          inlineTag.tagId === tag.id ||
                          inlineTag.tagName === tag.name,
                      ),
                    ) && (
                      <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        All available tags are already applied to this
                        selection.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {references.length > 0 && (
              <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                <SectionHeader
                  section="references"
                  label={
                    contextMenu.hasReferenceMark
                      ? "Change reference"
                      : "Link selected text to reference"
                  }
                  count={
                    references.filter(
                      (reference) =>
                        !contextMenu.references.some(
                          (inlineReference) =>
                            inlineReference.referenceId === reference.id,
                        ),
                    ).length
                  }
                />

                {openSections.references && (
                  <div className="max-h-40 overflow-y-auto pr-1">
                    <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-1 dark:bg-gray-900">
                      <div className="relative">
                        <Search
                          className="
        pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5
        -translate-y-1/2 text-gray-400
      "
                        />

                        <label htmlFor="reference-search" className="sr-only">
                          Search references
                        </label>

                        <input
                          type="text"
                          value={referenceSearch}
                          onChange={(event) =>
                            setReferenceSearch(event.target.value)
                          }
                          placeholder="Search references..."
                          id="reference-search"
                          className="
        w-full rounded-lg border border-gray-300 bg-white
        py-1.5 pl-7 pr-2
        text-xs text-gray-800 outline-none
        placeholder:text-gray-400
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100
        dark:placeholder:text-gray-500
        dark:focus:border-blue-500 dark:focus:ring-blue-900/40
      "
                        />
                      </div>
                    </div>
                    {filteredReferences
                      .filter(
                        (reference) =>
                          !contextMenu.references.some(
                            (inlineReference) =>
                              inlineReference.referenceId === reference.id,
                          ),
                      )
                      .map((reference) => {
                        const selected = selectedReferenceIds.includes(
                          reference.id,
                        );
                        const isInline = inlineReferenceIds.includes(
                          reference.id,
                        );

                        return (
                          <button
                            key={reference.id}
                            type="button"
                            onClick={() =>
                              onLinkSelectionToReference(reference)
                            }
                            className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                          >
                            <span className="block font-medium">
                              {getReferenceLabel(reference)}
                            </span>

                            <span className="block text-xs opacity-75">
                              {isInline
                                ? "Used in text"
                                : selected
                                  ? "Attached to note"
                                  : "Not attached"}
                            </span>
                          </button>
                        );
                      })}

                    {references.every((reference) =>
                      contextMenu.references.some(
                        (inlineReference) =>
                          inlineReference.referenceId === reference.id,
                      ),
                    ) && (
                      <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        All available references are already linked to this
                        selection.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            {availableNotes.length > 0 && (
              <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                <SectionHeader
                  section="notes"
                  label={
                    contextMenu.hasNoteLinkMark
                      ? "Change note link"
                      : "Link selected text to note"
                  }
                  count={
                    availableNotes.filter(
                      (note) =>
                        !contextMenu.noteLinks.some(
                          (inlineNote) => inlineNote.noteId === note.id,
                        ),
                    ).length
                  }
                />

                {openSections.notes && (
                  <div className="max-h-40 overflow-y-auto pr-1">
                    <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-1 dark:bg-gray-900">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                        <label htmlFor="note-search" className="sr-only">
                          Search notes
                        </label>

                        <input
                          type="text"
                          value={noteSearch}
                          onChange={(event) =>
                            setNoteSearch(event.target.value)
                          }
                          placeholder="Search notes..."
                          id="note-search"
                          className="
                w-full rounded-lg border border-gray-300 bg-white
                py-1.5 pl-7 pr-2
                text-xs text-gray-800 outline-none
                placeholder:text-gray-400
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100
                dark:placeholder:text-gray-500
                dark:focus:border-blue-500 dark:focus:ring-blue-900/40
              "
                        />
                      </div>
                    </div>

                    {filteredNotes
                      .filter(
                        (note) =>
                          !contextMenu.noteLinks.some(
                            (inlineNote) => inlineNote.noteId === note.id,
                          ),
                      )
                      .map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => onLinkSelectionToNote(note)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                        >
                          {note.title}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
