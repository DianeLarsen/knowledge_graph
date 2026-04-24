import { getNotesByUser } from "@/db/queries/notes";
import { Note } from "@/db/schema";
import Link from "next/link";



export default async function NotesPage() {
    const userId = "72d9a5a1-00f1-471b-8abd-5d8e838241db";
    const notes = await getNotesByUser(userId);
  return (
    <div>
          <h1>Notes</h1>
          {notes &&notes.map((note: Note) => (
            <ul>
                  <li>
                      <Link href={`/notes/${note.id}`}>
                        <h2>{note.title}</h2>
                      </Link>
                      <p>{note.content}</p>
                    </li>
                  </ul>
                ))   }
    </div>
  )
}