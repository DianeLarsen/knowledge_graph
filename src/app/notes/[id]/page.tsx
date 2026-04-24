import NoteCard from "@/components/NoteCard";
import { getNoteDetailsById } from "@/db/queries/notes";
import { Note } from "@/db/schema";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default async function NoteDetails({
  params,
}: {
  params: { id: string };
}) {
  const data = await getNoteDetailsById(params.id);

  if (!data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      Note Details
      <NoteCard data={data} />
    </div>
  );
}
