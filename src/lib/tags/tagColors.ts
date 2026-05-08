// src/lib/tags/tagColors.ts

export const TAG_COLORS = [
  "blue",
  "sky",
  "cyan",
  "teal",
  "emerald",
  "green",
  "lime",
  "amber",
  "orange",
  "rose",
  "pink",
  "purple",
  "violet",
  "indigo",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export function getRandomTagColor(): TagColor {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}