import { Note, Tag } from "@/db/schema";
import TagPill from "@/components/TagPill";
import ReadOnlyNoteContent from "@/components/ReadOnlyNoteContent";
import { getTagStats } from "@/db/queries/tags";

type NoteDetails = {
  note: Note;
  tags: Tag[];
  outgoingLinks: any[];
  backlinks: any[];
  sharedTags: any[];
};

export default async function NoteCard({ data }: { data: NoteDetails }) {
  const { note, tags } = data;

  const tagStats = await Promise.all(
    tags.map(async (tag) => {
      const stats = await getTagStats(tag.id);

      return {
        tag,
        stats,
      };
    }),
  );
console.log(note)
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
          <h1 className="font-['Comic_Sans_MS','Bradley_Hand',cursive] text-2xl font-semibold text-gray-950 dark:text-gray-100">
            {note.title}
          </h1>
        </IndexLine>

        <div
          className="
    min-h-40 px-4 py-0
bg-[linear-gradient(to_bottom,transparent_31px,#93c5fd_32px)]
bg-[length:100%_32px]
dark:bg-[linear-gradient(to_bottom,transparent_31px,#60a5fa_32px)]
  "
        >
          <ReadOnlyNoteContent content={note.contentJson} />
        </div>

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
        flex min-h-10 items-end px-4 pl-4
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
