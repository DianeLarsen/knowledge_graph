"use client";

import { useState } from "react";
import { createReferenceAction } from "@/app/actions/references";

export default function NewReferenceForm() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        New reference
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await createReferenceAction({
          type: String(formData.get("type") ?? "other") as
            | "book"
            | "website"
            | "article"
            | "video"
            | "conversation"
            | "other",
          title: String(formData.get("title") ?? "").trim(),
          author: String(formData.get("author") ?? "").trim() || null,
          url: String(formData.get("url") ?? "").trim() || null,
          publisher: String(formData.get("publisher") ?? "").trim() || null,
          publishedDate:
            String(formData.get("publishedDate") ?? "").trim() || null,
          notes: String(formData.get("notes") ?? "").trim() || null,
        });

        setIsOpen(false);
      }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          New reference
        </h2>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-3">
        <input
          name="title"
          required
          placeholder="Title"
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <input
          name="author"
          placeholder="Author"
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <input
          name="url"
          placeholder="URL"
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <select
            name="type"
            defaultValue="website"
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="book">Book</option>
            <option value="website">Website</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="conversation">Conversation</option>
            <option value="other">Other</option>
          </select>

          <input
            name="publisher"
            placeholder="Publisher"
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />

          <input
            name="publishedDate"
            placeholder="Published date"
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>

        <textarea
          name="notes"
          rows={3}
          placeholder="Why this matters"
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create reference
        </button>
      </div>
    </form>
  );
}