"use client";

import { useEffect, useRef, useState } from "react";
import { TagColor } from "@/lib/types/tags/tagColors";
import { tagPillColorClasses } from "@/lib/tagColorClasses";
import { createPortal } from "react-dom";
import MiniNotePreviewCard from "@/components/notes/card/MiniNotePreviewCard";

type TagStats = {
  tagId: string;
  tagName: string;
  noteCount: number;
  notes?: {
    id: string;
    title: string;
  }[];
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
  currentNoteId?: string;
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
  currentNoteId,
}: TagPillProps) {
  const [open, setOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [pinned, setPinned] = useState(false);
  const [previewNote, setPreviewNote] = useState<{
    id: string;
    title: string;
    content?: string | null;
  } | null>(null);

  const ref = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [popupHeight, setPopupHeight] = useState(0);
  const [hoverSuppressed, setHoverSuppressed] = useState(false);
  const otherLinkedNotes =
    stats?.notes?.filter((note) => note.id !== currentNoteId) ?? [];
  useEffect(() => {
    if (!open || !popupRef.current) return;

    setPopupHeight(popupRef.current.offsetHeight);
  }, [open, previewNote, otherLinkedNotes.length]);

  useEffect(() => {
   function handleClickOutside(event: MouseEvent) {
     const target = event.target as Node;

     const clickedPill = ref.current?.contains(target) ?? false;
     const clickedPopup = popupRef.current?.contains(target) ?? false;
     const clickedPreview = previewRef.current?.contains(target) ?? false;

     if (!clickedPill && !clickedPopup && !clickedPreview) {
       closePopup();
     }
   }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

function openPopup() {
  if (hoverSuppressed) return;

  const rect = ref.current?.getBoundingClientRect();
  if (!rect) return;

  setPopupPosition({
    left: rect.left,
    top: rect.bottom + 8,
  });

  setOpen(true);
}

  function closePopup() {
    setOpen(false);
    setPinned(false);
    setPreviewNote(null);
  }

  const linkedColorClass = tagPillColorClasses[color];
  const activeClass =
    "border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-300 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-100 dark:ring-blue-800";



  return (
    <span
      ref={ref}
      className="relative inline-flex align-middle"
      onMouseEnter={openPopup}
      onMouseLeave={() => {
        setHoverSuppressed(false);

        if (!pinned) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();

          if (pinned && open) {
            setHoverSuppressed(true);
            closePopup();
            return;
          }
          if (onOpenCardsByTag) {
            onOpenCardsByTag(tag.id);
            return;
          }
          if (linked) {
            onJumpToInlineTag?.(tag.id);
          }
          openPopup();
          setPinned(true);
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

      {typeof document !== "undefined" &&
        open &&
        popupPosition &&
        createPortal(
          <>
            <div
              ref={popupRef}
              className="
        pointer-events-auto fixed z-[9999] w-48 rounded-xl
        border border-[rgb(var(--border))]
        bg-[rgb(var(--card))]
        p-3 text-left shadow-lg
      "
              style={{
                left: popupPosition.left,
                top: popupPosition.top,
              }}
            >
              <p className="font-semibold text-[rgb(var(--text))]">
                #{tag.name}
              </p>

              {otherLinkedNotes.length === 0 ? (
                <p className="mt-2 text-sm text-[rgb(var(--muted-text))]">
                  {onOpenCardsByTag ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenCardsByTag(tag.id);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Open {stats?.noteCount ?? 0} card{stats?.noteCount !== 1 ? "s" : ""} with this tag
                    </button>
                  ) : (stats?.noteCount ?? 0) <= 1 ? (
                    "Only linked to this card."
                  ) : (
                    `Cards with this tag: ${stats?.noteCount ?? 0}. Card list not loaded yet.`
                  )}
                </p>
              ) : (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-[rgb(var(--muted-text))]">
                    Also linked to:
                  </p>

                  {otherLinkedNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPinned(true);
                        setPreviewNote(note);
                      }}
                      className="
      block w-full rounded-lg px-2 py-1
      text-left text-sm text-[rgb(var(--text))]
      hover:bg-[rgb(var(--card-muted))]
    "
                    >
                      {note.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {previewNote && (
              <div
                ref={previewRef}
                className="fixed z-[10000]"
                style={{
                  left: popupPosition.left,
                  top: popupPosition.top + popupHeight + 64,
                }}
              >
                <MiniNotePreviewCard
                  noteId={previewNote.id}
                  title={previewNote.title}
                  content={previewNote.content}
                  relationshipLabel="Shared tag"
                  tagName={tag.name}
                  onClose={() => setPreviewNote(null)}
                />
              </div>
            )}
          </>,
          document.body,
        )}
    </span>
  );
}
