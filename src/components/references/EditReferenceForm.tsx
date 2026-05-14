"use client";

import { updateReferenceAction } from "@/app/actions/references";

type ReferenceType =
  | "book"
  | "website"
  | "article"
  | "video"
  | "conversation"
  | "other";

type EditableReference = {
  id: string;
  type: string;
  title: string;
  author: string | null;
  url: string | null;
  publisher?: string | null;
  publishedDate?: Date | string | null;
  citation?: string | null;
  notes: string | null;
};

type EditReferenceFormProps = {
  reference: EditableReference;
  onCancel: () => void;
};

export default function EditReferenceForm({
  reference,
  onCancel,
}: EditReferenceFormProps) {
  const type = reference.type as ReferenceType;

  return (
    <form
      action={async (formData) => {
        await updateReferenceAction(formData);
      }}
      className="space-y-3"
    >
      <input type="hidden" name="id" value={reference.id} />

      <input
        name="title"
        required
        defaultValue={reference.title}
        placeholder="Title"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <select
        name="type"
        defaultValue={type}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      >
        <option value="book">Book</option>
        <option value="website">Website</option>
        <option value="article">Article</option>
        <option value="video">Video</option>
        <option value="conversation">Conversation</option>
        <option value="other">Other</option>
      </select>

      <input
        name="author"
        defaultValue={reference.author ?? ""}
        placeholder={
          type === "website"
            ? "Author or organization"
            : type === "video"
              ? "Creator or channel"
              : "Author"
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="publisher"
          defaultValue={reference.publisher ?? ""}
          placeholder={
            type === "article"
              ? "Journal / Publisher"
              : type === "website"
                ? "Website name / Publisher"
                : type === "video"
                  ? "Platform"
                  : "Publisher"
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />

        <input
          name="publishedDate"
          defaultValue={
            reference.publishedDate
              ? String(reference.publishedDate).slice(0, 10)
              : ""
          }
          placeholder="Published date"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />
      </div>

      <input
        name="url"
        defaultValue={reference.url ?? ""}
        placeholder="URL"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <textarea
        name="citation"
        defaultValue={reference.citation ?? ""}
        placeholder="Manual citation override"
        rows={2}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <textarea
        name="notes"
        defaultValue={reference.notes ?? ""}
        placeholder="Why this matters"
        rows={4}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
