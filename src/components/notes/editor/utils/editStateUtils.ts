// components/notes/editor/utils/editStateUtils.ts
export function sameStringSet(
  a: string[],
  b: string[],
  normalize: (value: string) => string,
) {
  const aSet = new Set(a.map(normalize).filter(Boolean));
  const bSet = new Set(b.map(normalize).filter(Boolean));

  if (aSet.size !== bSet.size) return false;

  return Array.from(aSet).every((item) => bSet.has(item));
}

export function sameStringSetRaw(a: string[], b: string[]) {
  const aSet = new Set(a.filter(Boolean));
  const bSet = new Set(b.filter(Boolean));

  if (aSet.size !== bSet.size) return false;

  return Array.from(aSet).every((item) => bSet.has(item));
}