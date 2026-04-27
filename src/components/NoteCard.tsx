import { Note, Tag } from "@/db/schema";
import TagPill from "@/components/TagPill";
import { getTagStats } from "@/db/queries/tags";

type NoteDetails = {
  note: Note;
  tags: Tag[];
  outgoingLinks: any[];
  backlinks: any[];
  sharedTags: any[];
};

const MAX_CARD_LINES = 5;

export default async function NoteCard({ data }: { data: NoteDetails }) {
  const { note, tags } = data;

  const contentLines = note.content
    ? note.content.split("\n").filter(Boolean)
    : ["No content yet."];

  const visibleLines = contentLines.slice(0, MAX_CARD_LINES);
  const hasOverflow = contentLines.length > MAX_CARD_LINES;

  const tagStats = await Promise.all(
    tags.map(async (tag) => {
      const stats = await getTagStats(tag.id);

      return {
        tag,
        stats,
      };
    }),
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <article
        className="
          w-full border border-gray-200 bg-white
          shadow-[8px_8px_0_rgba(0,0,0,0.06),16px_16px_0_rgba(0,0,0,0.04),24px_24px_0_rgba(0,0,0,0.03)]
          dark:border-gray-800 dark:bg-gray-950
        "
      >

        {tagStats.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {tagStats.map(({ tag, stats }) => (
              <TagPill key={tag.id} tag={tag} stats={stats} />
            ))}
          </div>
        )}

        <IndexLine isRed>
          <h1 className="font-['Comic_Sans_MS','Bradley_Hand',cursive] text-4xl font-semibold text-gray-950 dark:text-gray-100">
            {note.title}
          </h1>
        </IndexLine>

        {visibleLines.map((line, index) => (
          <IndexLine key={index}>
            <p className="font-['Comic_Sans_MS','Bradley_Hand',cursive] text-2xl text-gray-900 dark:text-gray-100">
              {line}
            </p>
          </IndexLine>
        ))}

        {hasOverflow && (
          <IndexLine>
            <p className="font-['Comic_Sans_MS','Bradley_Hand',cursive] text-xl italic text-gray-500 dark:text-gray-400">
              Continued on next card →
            </p>
          </IndexLine>
        )}

        <IndexLine />
      </article>
    </div>
  );
}

function IndexLine({
  children,
  isRed = false,
}: {
  children?: React.ReactNode;
  isRed?: boolean;
}) {
  return (
    <div
      className={`
        flex min-h-10 items-end px-4 pl-12
        border-b
        ${
          isRed
            ? "border-red-400 dark:border-red-400"
            : "border-blue-300 dark:border-blue-400"
        }
      `}
    >
      <div className="translate-y-1 break-words">{children}</div>
    </div>
  );
}
