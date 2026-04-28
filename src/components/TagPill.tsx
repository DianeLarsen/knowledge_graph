"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

type TagStats = {
  tagId: string;
  tagName: string;
  noteCount: number;
} | null;

type TagPillProps = {
  tag: {
    id: string;
    name: string;
  };
  stats: TagStats;
};



export default function TagPill({ tag, stats }: TagPillProps) {
  const [open, setOpen] = useState(false);
 const ref = useRef<HTMLSpanElement>(null);

 useEffect(() => {
   function handleClickOutside(event: MouseEvent) {
     if (ref.current && !ref.current.contains(event.target as Node)) {
       setOpen(false);
     }
   }

   document.addEventListener("mousedown", handleClickOutside);

   return () => {
     document.removeEventListener("mousedown", handleClickOutside);
   };
 }, []);
  return (
    <span
      ref={ref}
      className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="
        inline-flex rounded-full border border-gray-300 bg-white px-3 py-1
        text-sm font-medium text-gray-700 shadow-sm
        hover:bg-gray-100
        dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200
        dark:hover:bg-gray-800
      "
      >
        #{tag.name}
      </button>

      {open && (
        <span
          className="
          absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200
          bg-white p-4 text-left shadow-lg
          dark:border-gray-700 dark:bg-gray-900
        "
        >
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            #{tag.name}
          </p>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Cards with this tag: {stats?.noteCount ?? 0}
          </p>

          <Link
            href={`/tags/${tag.id}`}
            className="mt-3 block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View all cards
          </Link>
        </span>
      )}
    </span>
  );
}
