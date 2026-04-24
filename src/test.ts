import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "./db/queries/notes";

async function runTests() {
  console.log("=== START TESTS ===");

  // 1. Create a note
  const note = await createNote("Test Title", "Test Content");
  console.log("Created Note:", note);

  if (!note?.id) {
    throw new Error("Create note failed: no id returned");
  }

  // 2. Get all notes
  const allNotes = await getAllNotes();
  console.log("All Notes:", allNotes);

  if (allNotes.length === 0) {
    throw new Error("Get all notes failed: empty result");
  }

  // 3. Get note by id
  const fetched = await getNoteById(note.id);
  console.log("Fetched Note:", fetched);

  if (!fetched || fetched.id !== note.id) {
    throw new Error("Get note by id failed");
  }

  // 4. Update note
  const updated = await updateNote(
    note.id,
    "Updated Title",
    "Updated Content"
  );
  console.log("Updated Note:", updated);

  if (updated.title !== "Updated Title") {
    throw new Error("Update note failed");
  }

  // 5. Delete (soft delete)
  const deleted = await deleteNote(note.id);
  console.log("Deleted Note (soft):", deleted);

  if (!deleted.deletedAt) {
    throw new Error("Delete note failed: deletedAt not set");
  }

  // 6. Ensure deleted note is NOT returned in getAllNotes
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