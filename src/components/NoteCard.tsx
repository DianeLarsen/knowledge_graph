import { Note, Tag } from "@/db/schema";

type NoteDetails = {
  note: Note;
  tags: Tag[];
  outgoingLinks: any[]; // tighten later
  backlinks: any[];
  sharedTags: any[];
};

const NoteCard = ({ data }: { data: NoteDetails }) => {
    const { note, tags } = data;

  return (
    <div>
      <h2>{note.title}</h2>
          <p>{note.content}</p>
           {tags && tags?.map((tag) => (
            <span key={tag.id}>{tag.name} </span>
          ))}
    </div>
  )
}

export default NoteCard
