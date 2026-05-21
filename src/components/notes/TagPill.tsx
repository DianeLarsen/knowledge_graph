"use client";

import { useEffect, useRef, useState } from "react";
import { TagColor } from "@/lib/types/tags/tagColors";
import { tagPillColorClasses } from "@/lib/tagColorClasses";

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
  active?: boolean;
};

export default function TagPill({
  tag,
  stats = null,
  onOpenCardsByTag,
  onJumpToInlineTag,
  linked = false,
  color = "blue",
  size = "md",
  active = false,
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

  const linkedColorClass = tagPillColorClasses[color];
const activeClass =
  "border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-300 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-100 dark:ring-blue-800";
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
          if (onOpenCardsByTag) {
            onOpenCardsByTag(tag.id);
            return;
          }

          if (linked) {
            onJumpToInlineTag?.(tag.id);
          }
        }}
        className={`
  inline-flex items-center rounded-full border font-medium shadow-sm transition
${
  active
    ? activeClass
    : linked
      ? linkedColorClass
      : "border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-200"
}
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
