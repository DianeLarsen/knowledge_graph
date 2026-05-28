import type { Note } from "@/db/schema";
import type { TagColor } from "@/lib/types/tags/tagColors";
import ReadOnlyNoteContent from "@/components/notes/card/ReadOnlyNoteContent";
import type { NoteCardTag } from "./noteCardTypes";
import type { NoteLinkedReference } from "@/lib/types/references/referenceTypes";

export default function NoteCardContent({
  note,
  tags,
  references,
  tagColorMap,
  compact,
}: {
  note: Note;
  tags: NoteCardTag[];
  references: NoteLinkedReference[];
  tagColorMap: Record<string, TagColor>;
  compact: boolean;
}) {
  return (
    <div
      className={`
        ${compact ? "h-[180px] pb-2 pt-0" : "min-h-[150px] pb-2 pt-0"}
       ${compact ? "overflow-y-auto scrollbar-gutter-stable custom-scrollbar" : ""}
      `}
    >
      <div
        className={`
          ${compact ? "min-h-full" : "min-h-[150px]"}
          bg-[linear-gradient(to_bottom,transparent_27px,#93c5fd_28px,transparent_29px)]
          bg-[length:100%_30px]
          bg-[position:0_0px]
          dark:bg-[linear-gradient(to_bottom,transparent_27px,#60a5fa_28px,transparent_29px)]
        `}
      >
        <div
          className="
            pt-[5.75px]
            text-sm leading-[30px]

            [&_p]:m-0
            [&_p]:min-h-[30px]
            [&_p]:leading-[30px]

            [&_span]:leading-[inherit]
            [&_a]:leading-[inherit]
            [&_mark]:leading-[inherit]

            [&_.tag-mark]:inline
            [&_.tag-mark]:align-baseline
            [&_.tag-mark]:leading-[inherit]

            [&_.reference-mark]:inline
            [&_.reference-mark]:align-baseline
            [&_.reference-mark]:leading-[inherit]

            [&_[data-tag-name]]:inline
            [&_[data-tag-name]]:align-baseline
            [&_[data-tag-name]]:leading-[inherit]
          "
        >
          <ReadOnlyNoteContent
            key={note.contentJson ?? note.content ?? note.updatedAt.toString()}
            content={note.contentJson}
            references={references.map((reference) => ({
              id: reference.id,
              type: reference.type ?? "other",
              title: reference.title,
              author: reference.author,
              url: reference.url,
              publisher: reference.publisher,
              publishedDate: reference.publishedDate,
              citation: reference.citation,
              notes: reference.notes,
            }))}
            tags={tags.map((tag) => ({
              id: tag.id,
              name: tag.name,
              color: tag.color,
            }))}
            tagColorMap={tagColorMap}
          />
        </div>
      </div>
    </div>
  );
}
