"use client";

import { useMemo, useState } from "react";
import ReferenceCard from "@/components/references/ReferenceCard";

type Reference = {
  id: string;
  userId: string;
  type: "book" | "website" | "article" | "video" | "conversation" | "other";
  title: string;
  author: string | null;
  url: string | null;
  publisher: string | null;
  publishedDate: Date | string | null;
  citation: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  linkCount: number;
  linkedNotes: {
    id: string;
    title: string;
    content: string;
  }[];
};

type ReferenceType = Reference["type"] | "all";
type SortOption = "newest" | "title" | "author";

export default function ReferenceList({
  references,
}: {
  references: Reference[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReferenceType>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const filteredReferences = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return references
      .filter((reference) => {
        const matchesType =
          typeFilter === "all" || reference.type === typeFilter;

        const searchableText = [
          reference.title,
          reference.author,
          reference.url,
          reference.notes,
          reference.publisher,
          reference.citation,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !query || searchableText.includes(query);

        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOption === "title") {
          return a.title.localeCompare(b.title);
        }

        if (sortOption === "author") {
          return (a.author ?? "").localeCompare(b.author ?? "");
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [references, searchQuery, typeFilter, sortOption]);

  return (
    <section>
      <div className="mb-6 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search references by title, author, URL, notes..."
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                "all",
                "book",
                "website",
                "article",
                "video",
                "conversation",
                "other",
              ] as const
            ).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  typeFilter === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <select
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value as SortOption)
            }
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="newest">Newest first</option>
            <option value="title">Title A-Z</option>
            <option value="author">Author A-Z</option>
          </select>
        </div>
      </div>

      {filteredReferences.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No references match this search. The evidence is hiding, or it never
          existed. Both are troubling.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredReferences.map((reference) => (
            <ReferenceCard key={reference.id} reference={reference} />
          ))}
        </div>
      )}
    </section>
  );
}
