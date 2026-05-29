import { useLayoutEffect, useRef, useState } from "react";
import TagPill from "@/components/tags/TagPill";
import type { NoteCardTag, NoteDetails } from "./noteCardTypes";
import { createPortal } from "react-dom";
import MiniNotePreviewCard from "@/components/notes/card/MiniNotePreviewCard";

type InlineTagInfo = {
  ids: Set<string>;
  names: Set<string>;
};

const tagRowClassName = "relative flex h-11 items-start px-1 pb-1 pt-3 pr-16";

export default function NoteCardTags({
  currentNoteId,
  tags,
  tagStats,
  inlineTags,
}: {
  currentNoteId: string;
  tags: NoteCardTag[];
  tagStats: NoteDetails["tagStats"];
  inlineTags: InlineTagInfo;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useLayoutEffect(() => {
    function updateVisibleTags() {
      const row = rowRef.current;
      const measure = measureRef.current;

      if (!row || !measure) return;

      const availableWidth = row.clientWidth - 8;
      const tagElements = Array.from(
        measure.querySelectorAll<HTMLElement>("[data-measure-tag]"),
      );

      let usedWidth = 0;
      let count = 0;

      for (const element of tagElements) {
        const nextWidth = element.offsetWidth + 4;
        const remainingTags = tags.length - count - 1;
        const overflowBadgeWidth = remainingTags > 0 ? 40 : 0;

        if (usedWidth + nextWidth + overflowBadgeWidth > availableWidth) {
          break;
        }

        usedWidth += nextWidth;
        count += 1;
      }

      setVisibleCount(Math.max(0, count));
    }

    updateVisibleTags();

    const observer = new ResizeObserver(updateVisibleTags);

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, [tags]);

  const sortedTags = [...tags].sort((a, b) => {
    const aIsInline =
      inlineTags.ids.has(a.id) || inlineTags.names.has(a.name.toLowerCase());

    const bIsInline =
      inlineTags.ids.has(b.id) || inlineTags.names.has(b.name.toLowerCase());

    if (aIsInline && !bIsInline) return -1;
    if (!aIsInline && bIsInline) return 1;

    return a.name.localeCompare(b.name);
  });

  const visibleTags = sortedTags.slice(0, visibleCount);
  const hiddenTags = sortedTags.slice(visibleCount);

  if (tags.length === 0) {
    return (
      <div className={tagRowClassName}>
        <span
          className="
            rounded-full border border-dashed border-gray-300 bg-gray-50 px-2.5 py-0.5
            text-[13px] font-medium text-gray-500
            dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400
          "
        >
          No tags
        </span>
      </div>
    );
  }

  return (
    <>
      <div className={tagRowClassName}>
        <div
          ref={rowRef}
          className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden"
        >
          {visibleTags.map((tag) => {
            const stats =
              tagStats?.find((item) => item.tag.id === tag.id)?.stats ?? null;

            return (
              <TagPill
                key={tag.id}
                tag={tag}
                stats={stats}
                size="card"
                linked={
                  inlineTags.ids.has(tag.id) ||
                  inlineTags.names.has(tag.name.toLowerCase())
                }
                color={tag.color ?? "blue"}
                onJumpToInlineTag={(tagId) => {
                  document
                    .querySelector(
                      `[data-inline-tag-id="${tagId}"], [data-tag-id="${tagId}"]`,
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
                currentNoteId={currentNoteId}
              />
            );
          })}

          {hiddenTags.length > 0 && (
            <HiddenTagsMenu
              currentNoteId={currentNoteId}
              hiddenTags={hiddenTags}
              tagStats={tagStats}
            />
          )}
        </div>
      </div>

      <div
        ref={measureRef}
        className="pointer-events-none invisible absolute -left-[9999px] top-0 flex flex-nowrap gap-1"
      >
        {tags.map((tag) => {
          const stats =
            tagStats?.find((item) => item.tag.id === tag.id)?.stats ?? null;

          return (
            <span key={tag.id} data-measure-tag>
              <TagPill
                tag={tag}
                stats={stats}
                size="card"
                linked={
                  inlineTags.ids.has(tag.id) ||
                  inlineTags.names.has(tag.name.toLowerCase())
                }
                color={tag.color ?? "blue"}
                onJumpToInlineTag={() => {}}
                currentNoteId={currentNoteId}
              />
            </span>
          );
        })}
      </div>
    </>
  );
}

function HiddenTagsMenu({
  currentNoteId,
  hiddenTags,
  tagStats,
}: {
  currentNoteId: string;
  hiddenTags: NoteCardTag[];
  tagStats: NoteDetails["tagStats"];
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [previewNote, setPreviewNote] = useState<{
    id: string;
    title: string;
    content?: string | null;
  } | null>(null);

  const [popupPosition, setPopupPosition] = useState<{
    right: number;
    top: number;
  } | null>(null);

  const [popupHeight, setPopupHeight] = useState(0);

  const ref = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !popupRef.current) return;
    setPopupHeight(popupRef.current.offsetHeight);
  }, [open, selectedTagId, previewNote]);

  useLayoutEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const clickedButton = ref.current?.contains(target) ?? false;
      const clickedPopup = popupRef.current?.contains(target) ?? false;
      const clickedPreview = previewRef.current?.contains(target) ?? false;

      if (!clickedButton && !clickedPopup && !clickedPreview) {
        closePopup();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function openPopup() {
    const rect = ref.current?.getBoundingClientRect();

    if (!rect) return;

    setPopupPosition({
      right: window.innerWidth - rect.right,
      top: rect.bottom + 8,
    });

    setOpen(true);
  }

  function closePopup() {
    setOpen(false);
    setPinned(false);
    setSelectedTagId(null);
    setPreviewNote(null);
  }

  function getStatsForTag(tagId: string) {
    return tagStats?.find((item) => item.tag.id === tagId)?.stats ?? null;
  }

  const selectedTag = hiddenTags.find((tag) => tag.id === selectedTagId);
  const selectedStats = selectedTag ? getStatsForTag(selectedTag.id) : null;
  const otherLinkedNotes =
    selectedStats?.notes?.filter((note) => note.id !== currentNoteId) ?? [];

  return (
    <div
      ref={ref}
      className="shrink-0"
      onMouseEnter={openPopup}
      onMouseLeave={() => {
        if (!pinned) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();

          if (pinned && open) {
            closePopup();
            return;
          }

          openPopup();
          setPinned(true);
        }}
        className="
          rounded-full border border-[rgb(var(--border))]
          bg-[rgb(var(--card-muted))]
          px-2.5 py-0.5 text-[13px] font-medium
          text-[rgb(var(--text))] shadow-sm transition
          hover:border-[rgb(var(--border-strong))]
          hover:bg-[rgb(var(--card))]
        "
        aria-label={`Show ${hiddenTags.length} more tags`}
      >
        +{hiddenTags.length}
      </button>

      {typeof document !== "undefined" &&
        open &&
        popupPosition &&
        createPortal(
          <>
            <div
              ref={popupRef}
              className="
                pointer-events-auto fixed z-[9999] w-80 rounded-xl
                border border-[rgb(var(--border))]
                bg-[rgb(var(--card))]
                p-3 text-left shadow-lg
              "
              style={{
                right: popupPosition.right,
                top: popupPosition.top,
              }}
            >
              <p className="mb-2 text-xs font-semibold uppercase text-[rgb(var(--muted-text))]">
                Hidden tags
              </p>

              <div className="space-y-2">
                {hiddenTags.map((tag) => {
                  const stats = getStatsForTag(tag.id);
                  const isSelected = selectedTagId === tag.id;
                  const noteCount = stats?.noteCount ?? 0;

                  return (
                    <div
                      key={tag.id}
                      className="
                        rounded-lg border border-[rgb(var(--border))]
                        bg-[rgb(var(--card-muted))] p-2
                      "
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPinned(true);
                          setSelectedTagId(isSelected ? null : tag.id);
                          setPreviewNote(null);
                        }}
                        className="
                          flex w-full items-center justify-between gap-3
                          text-left text-sm text-[rgb(var(--text))]
                        "
                      >
                        <span className="whitespace-nowrap font-semibold underline decoration-dotted">
                          #{tag.name}
                        </span>

                        <span className="shrink-0 text-xs text-[rgb(var(--muted-text))]">
                          {noteCount} card{noteCount === 1 ? "" : "s"}
                        </span>
                      </button>

                      {isSelected && (
                        <div className="mt-2 border-t border-[rgb(var(--border))] pt-2">
                          {otherLinkedNotes.length === 0 ? (
                            <p className="text-xs text-[rgb(var(--muted-text))]">
                              {(stats?.noteCount ?? 0) <= 1
                                ? "Only linked to this card."
                                : `Cards with this tag: ${
                                    stats?.noteCount ?? 0
                                  }. Card list not loaded yet.`}
                            </p>
                          ) : (
                            <div className="space-y-1">
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
                                    hover:bg-[rgb(var(--card))]
                                  "
                                >
                                  {note.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {previewNote && selectedTag && (
              <div
                ref={previewRef}
                className="fixed z-[10000]"
                style={{
                  right: popupPosition.right,
                  top: popupPosition.top + popupHeight + 8,
                }}
              >
                <MiniNotePreviewCard
                  noteId={previewNote.id}
                  title={previewNote.title}
                  content={previewNote.content}
                  relationshipLabel="Shared tag"
                  tagName={selectedTag.name}
                  onClose={() => setPreviewNote(null)}
                />
              </div>
            )}
          </>,
          document.body,
        )}
    </div>
  );
}
