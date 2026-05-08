import type { RelationshipType } from "@/db/schema";

export const ENTITY_RELATIONSHIPS = [
  "related",
  "created_from",
  "supports",
  "blocks",
  "mentions",
  "uses",
  "follow_up",
  "depends_on",
  "duplicates",
  "is_duplicate_of",
  "references",
  "extends",
] as const satisfies readonly RelationshipType[];

export const ENTITY_RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  related: "Related",
  created_from: "Created from",
  supports: "Supports",
  blocks: "Blocks",
  mentions: "Mentions",
  uses: "Uses",
  follow_up: "Follow up",
  depends_on: "Depends on",
  duplicates: "Duplicates",
  is_duplicate_of: "Is duplicate of",
  references: "References",
  extends: "Extends",
};

export function getRelationshipLabel(type: RelationshipType) {
  return ENTITY_RELATIONSHIP_LABELS[type] ?? type;
}
