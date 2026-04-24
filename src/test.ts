import { createUser } from "./db/queries/users";
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
  getOrphanNotes,
  getRelatedNotes,
  getNotesSharingTags,
} from "./db/queries/notes";
import {
  createNoteLink,
  getOutgoingLinks,
  getBacklinks,
  removeNoteLink,
} from "./db/queries/noteLinks";
import { addTagToNote } from "./db/queries/notetags";
import { createTag } from "./db/queries/tags";

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
      link.relationshipType === "related",
  );

  if (!hasOutgoingLink) {
    throw new Error("Outgoing link not found");
  }

  const backlinks = await getBacklinks(targetNote.id);
  console.log("Backlinks:", backlinks);

  const hasBacklink = backlinks.some(
    (link) =>
      link.sourceTitle === "Updated Title" &&
      link.relationshipType === "related",
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
    (link) => link.targetNoteId === targetNote.id,
  );

  if (linkStillExists) {
    throw new Error("Removed link still appears in outgoing links");
  }

  // --- SEARCH TESTS ---

  const searchTitleNote = await createNote(
    "Binary Tree Basics",
    "Intro content",
    user.id,
  );

  const searchContentNote = await createNote(
    "Data Structures",
    "This note explains tree traversal",
    user.id,
  );

  console.log("Search Test Notes Created:", searchTitleNote, searchContentNote);

  const searchResults = await searchNotes("tree");
  console.log("Search Results:", searchResults);

  const foundTitleMatch = searchResults.some(
    (n) => n.id === searchTitleNote.id,
  );

  const foundContentMatch = searchResults.some(
    (n) => n.id === searchContentNote.id,
  );

  if (!foundTitleMatch || !foundContentMatch) {
    throw new Error("Search failed: expected notes not found");
  }

  // --- ORPHAN NOTES TEST ---

  const orphanNote = await createNote(
    "Lonely Note",
    "No one links to me",
    user.id,
  );

  const connectedSource = await createNote(
    "Connected Source",
    "Links out",
    user.id,
  );

  const connectedTarget = await createNote(
    "Connected Target",
    "Gets linked",
    user.id,
  );

  console.log("Orphan Test Notes Created:", {
    orphanNote,
    connectedSource,
    connectedTarget,
  });

  // Create a connection so these two are NOT orphans
  await createNoteLink(connectedSource.id, connectedTarget.id, "related");

  const orphanResults = await getOrphanNotes();
  console.log("Orphan Notes:", orphanResults);

  // Should include orphanNote
  const foundOrphan = orphanResults.some((n) => n.id === orphanNote.id);

  // Should NOT include connected notes
  const foundConnectedSource = orphanResults.some(
    (n) => n.id === connectedSource.id,
  );

  const foundConnectedTarget = orphanResults.some(
    (n) => n.id === connectedTarget.id,
  );

  if (!foundOrphan) {
    throw new Error("Orphan test failed: orphan note not found");
  }

  if (foundConnectedSource || foundConnectedTarget) {
    throw new Error("Orphan test failed: connected notes incorrectly included");
  }

  // --- SHARED TAG / RELATED NOTES TESTS ---

  const sharedTag = await createTag(`systems-${Date.now()}`);

  const taggedSourceNote = await createNote(
    "Tagged Source Note",
    "This note has a systems tag",
    user.id
  );

  const taggedRelatedNote = await createNote(
    "Tagged Related Note",
    "This note shares the systems tag",
    user.id
  );

  const untaggedNote = await createNote(
    "Untagged Note",
    "This note should not appear in shared tag results",
    user.id
  );

  await addTagToNote(taggedSourceNote.id, sharedTag.id);
  await addTagToNote(taggedRelatedNote.id, sharedTag.id);

  const sharedTagResults = await getNotesSharingTags(taggedSourceNote.id);
  console.log("Shared Tag Results:", sharedTagResults);

  const foundSharedTagNote = sharedTagResults.some(
    (n) =>
      n.id === taggedRelatedNote.id &&
      n.sharedTagId === sharedTag.id &&
      n.sharedTagName === sharedTag.name
  );

  const foundOriginalNote = sharedTagResults.some(
    (n) => n.id === taggedSourceNote.id
  );

  const foundUntaggedNote = sharedTagResults.some(
    (n) => n.id === untaggedNote.id
  );

  if (!foundSharedTagNote) {
    throw new Error("Shared tag test failed: related tagged note not found");
  }

  if (foundOriginalNote) {
    throw new Error("Shared tag test failed: original note was included");
  }

  if (foundUntaggedNote) {
    throw new Error("Shared tag test failed: untagged note was included");
  }

  const relatedNotes = await getRelatedNotes(taggedSourceNote.id);
  console.log("Related Notes:", relatedNotes);

  const foundInRelatedSharedTags = relatedNotes.sharedTags.some(
    (n) => n.id === taggedRelatedNote.id && n.sharedTagId === sharedTag.id
  );

  if (!foundInRelatedSharedTags) {
    throw new Error("Related notes test failed: shared tag result missing");
  }



  // Soft delete one and verify it disappears from search
  await deleteNote(searchTitleNote.id);

  const searchAfterDelete = await searchNotes("tree");
  console.log("Search After Delete:", searchAfterDelete);

  const stillFoundDeleted = searchAfterDelete.some(
    (n) => n.id === searchTitleNote.id,
  );

  if (stillFoundDeleted) {
    throw new Error("Search failed: deleted note still appears");
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
