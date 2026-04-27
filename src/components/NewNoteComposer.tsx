"use client";

import { useState } from "react";
import { Note, Tag } from "@/db/schema";
import RichNoteEditor from "./RichNoteEditor";
import { createNoteAction } from "@/app/actions/notes";
import { useRouter } from "next/navigation";

type NewNoteComposerProps = {
  notes: Note[];
  tags: Tag[];
};

export default function NewNoteComposer({ notes, tags }: NewNoteComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [linkedNoteIds, setLinkedNoteIds] = useState<string[]>([]);
  const [contentJson, setContentJson] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [hasSaved, setHasSaved] = useState(false);

  const router = useRouter();
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

    try {
      setIsSaving(true);
      setSavedMessage("");

      await createNoteAction({
        userId: "72d9a5a1-00f1-471b-8abd-5d8e838241db",
        title,
        content,
        contentJson,
        selectedTagIds,
        newTagName,
        linkedNoteIds,
      });

      setHasSaved(true);
      setSavedMessage("Card saved.");

      router.refresh();
    } catch (error) {
      console.error(error);
      setSavedMessage("Something went wrong. Card was not saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Create New Card
      </h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title"
        className="mb-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <RichNoteEditor
        onChange={({ plainText, json }) => {
          setContent(plainText);
          setContentJson(json);
        }}
      />

      <section className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Existing Tags
        </h3>

        <div className="mb-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
          {tags.length > 0 ? (
            tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    selected
                      ? "border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tags yet.
            </p>
          )}
        </div>

        <input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Create new tag"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />
      </section>

      <section className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Link Existing Cards
        </h3>

        <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
          {notes.length > 0 ? (
            notes.map((note) => {
              const selected = linkedNoteIds.includes(note.id);

              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => toggleLinkedNote(note.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                    selected
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {note.title}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No cards to link yet.
            </p>
          )}
        </div>
      </section>

      <section className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          References
        </h3>

        <input
          disabled
          placeholder="References coming next"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || hasSaved}
        className={`
    w-full rounded-xl px-4 py-2 font-medium text-white
    ${
      isSaving || hasSaved
        ? "cursor-not-allowed bg-gray-400"
        : "bg-blue-600 hover:bg-blue-700"
    }
  `}
      >
        {isSaving ? "Saving..." : hasSaved ? "Saved" : "Save Card"}
      </button>
      <button
        type="button"
        onClick={resetComposer}
        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        New Card
      </button>
      {savedMessage && (
        <p
          className={`mt-2 text-sm ${
            hasSaved
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {savedMessage}
        </p>
      )}
    </aside>
  );
}
