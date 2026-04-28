"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Note, Tag } from "@/db/schema";
import RichNoteEditor from "@/components/RichNoteEditor";
import { updateNoteAction } from "@/app/actions/notes";

type EditNoteFormProps = {
  note: Note;
  tags: Tag[];
  noteTags: Tag[];
};

export default function EditNoteForm({ note, tags, noteTags }: EditNoteFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? "");
  const [contentJson, setContentJson] = useState(note.contentJson ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
const [inlineTagNames, setInlineTagNames] = useState<string[]>([]);
  async function handleSave() {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setMessage("");

      await updateNoteAction({
        id: note.id,
        title,
        content,
        contentJson,
        inlineTagNames,
      });

      setMessage("Note saved.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Note was not saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Edit Note
      </h1>

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

        {noteTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {noteTags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tags on this note yet.
          </p>
        )}
      </div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Content
      </label>

      <RichNoteEditor
        initialContent={contentJson || content}
        tags={tags}
        onTagUsed={(tagName) => {
          setInlineTagNames((current) =>
            current.includes(tagName) ? current : [...current, tagName],
          );
        }}
        onChange={({ plainText, json }) => {
          setContent(plainText);
          setContentJson(json);
        }}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>

      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </section>
  );
}
