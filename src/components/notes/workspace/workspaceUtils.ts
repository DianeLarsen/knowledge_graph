import type { NoteDetails } from "@/components/notes/card/noteCardTypes";

export function getWorkspaceNotes(dataList: NoteDetails[]) {
  return dataList.map((data) => data.note);
}

export function getNoteOptions(dataList: NoteDetails[]) {
  return dataList.map((data) => ({
    id: data.note.id,
    title: data.note.title,
  }));
}

export function getWorkspaceTags(dataList: NoteDetails[]) {
  return Array.from(
    new Map(
      dataList.flatMap((data) => data.tags).map((tag) => [tag.id, tag]),
    ).values(),
  );
}

export function getWorkspaceTagStats(dataList: NoteDetails[]) {
  const tags = getWorkspaceTags(dataList);

  return tags.map((tag) => ({
    tag,
    stats: {
      tagId: tag.id,
      tagName: tag.name,
      noteCount: dataList.filter((data) =>
        data.tags.some((item) => item.id === tag.id),
      ).length,
    },
  }));
}

export function getOpenNotes(dataList: NoteDetails[], openNoteIds: string[]) {
  return dataList.filter((data) => openNoteIds.includes(data.note.id));
}

export function getNoteIdsByTag(dataList: NoteDetails[], tagId: string) {
  return dataList
    .filter((data) => data.tags.some((tag) => tag.id === tagId))
    .map((data) => data.note.id);
}

export function getPlainTextLength(data: NoteDetails) {
  return data.note.content?.length ?? 0;
}

export function addUniqueIds(current: string[], next: string[]) {
  return [...new Set([...current, ...next])];
}

export function removeIds(current: string[], idsToRemove: string[]) {
  const removeSet = new Set(idsToRemove);
  return current.filter((id) => !removeSet.has(id));
}

export function areAllIdsIncluded(current: string[], required: string[]) {
  return required.length > 0 && required.every((id) => current.includes(id));
}