import { createUser } from "./db/queries/users";
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "./db/queries/notes";
import {
  createNoteLink,
  getOutgoingLinks,
  getBacklinks,
  removeNoteLink,
} from "./db/queries/noteLinks";

async function runTests() {
  console.log("=== START TESTS ===");

  const user = await createUser("Diane Test User");
  console.log("Created User:", user);

  if (!user?.id) {
    throw new Error("Create user failed: no id returned");
  }

  const note = await createNote("Test Title", "Test Content", user.id);
  console.log("Created Note:", note);

  if (!note?.id) {
    throw new Error("Create note failed: no id returned");
  }

  const allNotes = await getAllNotes();
  console.log("All Notes:", allNotes);

  if (allNotes.length === 0) {
    throw new Error("Get all notes failed: empty result");
  }

  const fetched = await getNoteById(note.id);
  console.log("Fetched Note:", fetched);

  if (!fetched || fetched.id !== note.id) {
    throw new Error("Get note by id failed");
  }

  const updated = await updateNote(note.id, "Updated Title", "Updated Content");
  console.log("Updated Note:", updated);

  if (updated.title !== "Updated Title") {
    throw new Error("Update note failed");
  }

    const targetNote = await createNote("Target Note", "Target Content", user.id);
  console.log("Created Target Note:", targetNote);

  if (!targetNote?.id) {
    throw new Error("Create target note failed: no id returned");
  }

  const link = await createNoteLink(note.id, targetNote.id, "related");
  console.log("Created Link:", link);

  if (!link?.id) {
    throw new Error("Create note link failed: no id returned");
  }

  const outgoingLinks = await getOutgoingLinks(note.id);
  console.log("Outgoing Links:", outgoingLinks);

  const hasOutgoingLink = outgoingLinks.some(
    (link) =>
      link.targetNoteId === targetNote.id &&
      link.relationshipType === "related"
  );

  if (!hasOutgoingLink) {
    throw new Error("Outgoing link not found");
  }

  const backlinks = await getBacklinks(targetNote.id);
  console.log("Backlinks:", backlinks);

  const hasBacklink = backlinks.some(
    (link) =>
      link.sourceTitle === "Updated Title" &&
      link.relationshipType === "related"
  );

  if (!hasBacklink) {
    throw new Error("Backlink not found");
  }

  const removedLink = await removeNoteLink(note.id, targetNote.id, "related");
  console.log("Removed Link:", removedLink);

  if (!removedLink?.id) {
    throw new Error("Remove note link failed");
  }

  const outgoingAfterRemove = await getOutgoingLinks(note.id);
  console.log("Outgoing Links After Remove:", outgoingAfterRemove);

  const linkStillExists = outgoingAfterRemove.some(
    (link) => link.targetNoteId === targetNote.id
  );

  if (linkStillExists) {
    throw new Error("Removed link still appears in outgoing links");
  }

  const deleted = await deleteNote(note.id);
  console.log("Deleted Note (soft):", deleted);

  if (!deleted.deletedAt) {
    throw new Error("Delete note failed: deletedAt not set");
  }

  const remainingNotes = await getAllNotes();
  console.log("Remaining Notes:", remainingNotes);

  const stillExists = remainingNotes.find((n) => n.id === note.id);
  if (stillExists) {
    throw new Error("Deleted note still appears in getAllNotes");
  }

  console.log("=== ALL TESTS PASSED ===");
}

runTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});