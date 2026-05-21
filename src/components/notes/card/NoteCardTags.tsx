import { useLayoutEffect, useRef, useState } from "react";
import TagPill from "@/components/notes/TagPill";
import type { NoteCardTag, NoteDetails } from "./noteCardTypes";

type InlineTagInfo = {
  ids: Set<string>;
  names: Set<string>;
};

const tagRowClassName = "relative flex h-11 items-start px-1 pb-1 pt-3 pr-16";

export default function NoteCardTags({
  tags,
  tagStats,
  inlineTags,
}: {
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

  const visibleTags = tags.slice(0, visibleCount);
  const hiddenTags = tags.slice(visibleCount);

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
              />
            );
          })}

          {hiddenTags.length > 0 && (
            <HiddenTagsMenu hiddenTags={hiddenTags} tagStats={tagStats} />
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
              />
            </span>
          );
        })}
      </div>
    </>
  );
}

function HiddenTagsMenu({
  hiddenTags,
  tagStats,
}: {
  hiddenTags: NoteCardTag[];
  tagStats: NoteDetails["tagStats"];
}) {
  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        className="
          rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5
          text-[13px] font-medium text-gray-700 shadow-sm transition
          hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700
          dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200
          dark:hover:border-blue-400 dark:hover:bg-blue-900/40
          dark:hover:text-blue-200
        "
        aria-label={`Show ${hiddenTags.length} more tags`}
      >
        +{hiddenTags.length}
      </button>

      <div
        className="
          pointer-events-none absolute left-0 top-full z-50 mt-2
          min-w-max rounded-xl border border-gray-200 bg-white p-2
          text-left opacity-0 shadow-lg transition
          group-hover:pointer-events-auto group-hover:opacity-100
          dark:border-gray-700 dark:bg-gray-900
        "
      >
        <div className="space-y-1">
          {hiddenTags.map((tag) => {
            const stats =
              tagStats?.find((item) => item.tag.id === tag.id)?.stats ?? null;

            return (
              <div
                key={tag.id}
                className="
                  flex items-center justify-between gap-3 rounded-lg px-2 py-1
                  text-sm text-gray-700 dark:text-gray-200
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    document
                      .querySelector(`[data-inline-tag-id="${tag.id}"]`)
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                  className="whitespace-nowrap underline decoration-dotted"
                >
                  #{tag.name}
                </button>

                <span className="shrink-0 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  Cards with this tag: {stats?.noteCount ?? 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
