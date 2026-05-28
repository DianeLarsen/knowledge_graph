// src/components/tags/tagUtils.ts

export function normalizeTagName(value: string) {
  return value.trim().replace(/^#+/, "").trim();
}

export function normalizeTagSlug(value: string) {
  return normalizeTagName(value).toLowerCase();
}
