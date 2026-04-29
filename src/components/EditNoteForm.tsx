"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Note, Tag, Reference } from "@/db/schema";
import RichNoteEditor from "@/components/RichNoteEditor";
import { updateNoteAction } from "@/app/actions/notes";
import ReferenceComposer from "@/components/ReferenceComposer";

type NoteReferenceSummary = {
  id: string;
  type: Reference["type"];
  title: string;
  author: string | null;
  url: string | null;
  publisher: string | null;
  publishedDate: string | null;
  citation: string | null;
  notes: string | null;

  noteReferenceId: string;
  pageNumber: string | null;
  location: string | null;
  quote: string | null;
  summary: string | null;
};

type EditNoteFormProps = {
  note: Note;
  tags: Tag[];
  noteTags: Tag[];
  references: Reference[];
  userId: string;
  noteReferences: NoteReferenceSummary[];
};

export default function EditNoteForm({
  note,
  tags,
  noteTags,
  references,
  noteReferences,
  userId,
}: EditNoteFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? "");
  const [contentJson, setContentJson] = useState(note.contentJson ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [inlineTagNames, setInlineTagNames] = useState<string[]>([]);
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<string[]>(
    noteReferences.map((reference) => reference.id),
  );
  const [availableReferences, setAvailableReferences] =
    useState<Reference[]>(references);
  async function handleSave() {
    if (isSaving) return;
    if (selectedReferenceIds.length === 0) {
      setMessage("Add at least one reference before saving.");
      return;
    }
    try {
      setIsSaving(true);
      setMessage("");

      await updateNoteAction({
        id: note.id,
        title,
        content,
        contentJson,
        inlineTagNames,
        selectedReferenceIds,
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
  function toggleReference(referenceId: string) {
    setSelectedReferenceIds((current) =>
      current.includes(referenceId)
        ? current.filter((id) => id !== referenceId)
        : [...current, referenceId],
    );
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
        <ReferenceComposer
          userId={userId}
          onReferenceCreated={(reference) => {
            setAvailableReferences((current) => [reference, ...current]);
            setSelectedReferenceIds((current) =>
              current.includes(reference.id)
                ? current
                : [...current, reference.id],
            );
          }}
        />
      </section>

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
