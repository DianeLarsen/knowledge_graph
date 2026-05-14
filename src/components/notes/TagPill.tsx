"use client";

import { useEffect, useRef, useState } from "react";
import { TagColor } from "@/lib/tags/tagColors";


type TagStats = {
  tagId: string;
  tagName: string;
  noteCount: number;
} | null;

type TagPillProps = {
  tag: {
    id: string;
    name: string;
    color?: TagColor | null;
  };
  stats?: TagStats;
  onOpenCardsByTag?: (tagId: string) => void;
  onJumpToInlineTag?: (tagId: string) => void;
  linked?: boolean;
  color?: TagColor;
  size?: "sm" | "md" | "card";
};

export default function TagPill({
  tag,
  stats = null,
  onOpenCardsByTag,
  onJumpToInlineTag,
  linked = false,
  color = "blue",
  size = "md",
}: TagPillProps) {
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


const colorClasses = {
  blue: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200",
  purple:
    "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-200",
  emerald:
    "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  amber:
    "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  rose: "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200",
  cyan: "border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-950 dark:text-cyan-200",
  sky: "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200",
  teal: "border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-200",
  green:
    "border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-950 dark:text-green-200",
  lime: "border-lime-300 bg-lime-50 text-lime-700 hover:bg-lime-100 dark:border-lime-700 dark:bg-lime-950 dark:text-lime-200",
  orange:
    "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200",
  pink: "border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100 dark:border-pink-700 dark:bg-pink-950 dark:text-pink-200",
  violet:
    "border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-200",
  indigo:
    "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
};
  return (
    <span
      ref={ref}
      className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => {
          if (linked) {
            onJumpToInlineTag?.(tag.id);
            return;
          }

          onOpenCardsByTag?.(tag.id);
        }}
        className={`
  inline-flex items-center rounded-full border font-medium shadow-sm transition
  ${linked ? colorClasses[color] : "border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-200"}
  ${size === "sm" && "px-2 py-0.5 text-xs"}
  ${size === "card" && "px-2.5 py-0.5 text-[13px]"}
  ${size === "md" && "px-3 py-1 text-sm"}
  ${linked || onOpenCardsByTag ? "cursor-pointer" : "cursor-default"}
`}
      >
        <span
          className={`
    truncate
    ${size === "card" ? "max-w-[90px]" : "max-w-[140px]"}
  `}
        >
          #{tag.name}
        </span>
      </button>

      {open && (
        <span
          className="
            absolute left-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200
            bg-white p-3 text-left shadow-lg
            dark:border-gray-700 dark:bg-gray-900
          "
        >
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            #{tag.name}
          </p>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Cards with this tag: {stats?.noteCount ?? 0}
          </p>
        </span>
      )}
    </span>
  );
}
