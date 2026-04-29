"use client";

import { useState } from "react";
import { Reference } from "@/db/schema";
import { createReferenceAction } from "@/app/actions/references";
import { getCurrentUserId } from "@/lib/currentUser";

type ReferenceComposerProps = {
  userId: string;
  onReferenceCreated: (reference: Reference) => void;
};

export default function ReferenceComposer({
    userId,
  onReferenceCreated,
}: ReferenceComposerProps) {
  const [type, setType] = useState<Reference["type"]>("book");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [citation, setCitation] = useState("");
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCreateReference() {
    if (isSaving) return;

    if (!title.trim()) {
      setMessage("Reference needs a title.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      const reference = await createReferenceAction({
        userId: userId,
        type,
        title: title.trim(),
        author: author.trim() || undefined,
        url: url.trim() || undefined,
        publisher: publisher.trim() || undefined,
        publishedDate: publishedDate.trim() || undefined,
        citation: citation.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onReferenceCreated(reference);

      setTitle("");
      setAuthor("");
      setUrl("");
      setPublisher("");
      setPublishedDate("");
      setCitation("");
      setNotes("");
      setType("book");

      setMessage("Reference added.");
    } catch (error) {
      console.error(error);
      setMessage("Reference was not created.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Add New Reference
      </h4>

      <select
        value={type}
        onChange={(e) => setType(e.target.value as Reference["type"])}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      >
        <option value="book">Book</option>
        <option value="website">Website</option>
        <option value="article">Article</option>
        <option value="video">Video</option>
        <option value="conversation">Conversation</option>
        <option value="other">Other</option>
      </select>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <input
        value={publisher}
        onChange={(e) => setPublisher(e.target.value)}
        placeholder="Publisher"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <input
        value={publishedDate}
        onChange={(e) => setPublishedDate(e.target.value)}
        placeholder="Published date"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <textarea
        value={citation}
        onChange={(e) => setCitation(e.target.value)}
        placeholder="Citation"
        rows={2}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Reference notes"
        rows={2}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <button
        type="button"
        onClick={handleCreateReference}
        disabled={isSaving}
        className="rounded-xl bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        {isSaving ? "Adding..." : "Add Reference"}
      </button>

      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}
