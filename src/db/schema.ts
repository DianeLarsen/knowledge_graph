import {
  sqliteTable,
  text,
  integer,
  unique,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const notes = sqliteTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const tags = sqliteTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const noteTags = sqliteTable(
  "note_tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [unique("unique_note_tag").on(t.noteId, t.tagId)],
);

export const noteLinks = sqliteTable(
  "note_links",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),

    sourceNoteId: text("source_note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),

    targetNoteId: text("target_note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),

    relationshipType: text("relationship_type").notNull(),
  },
  (table) => [
    check("no_self_link", sql`${table.sourceNoteId} <> ${table.targetNoteId}`),

    unique("unique_note_link").on(
      table.sourceNoteId,
      table.targetNoteId,
      table.relationshipType,
    ),
  ],
);
