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
  contentJson: text("content_json"),
  userId: text("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),
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

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});


export const referencesTable = sqliteTable("references", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  type: text("type", {
    enum: ["book", "website", "article", "video", "conversation", "other"],
  }).notNull(),

  title: text("title").notNull(),
  author: text("author"),
  url: text("url"),
  publisher: text("publisher"),
  publishedDate: text("published_date"),

  citation: text("citation"),
  notes: text("notes"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const noteReferences = sqliteTable(
  "note_references",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),

    referenceId: text("reference_id")
      .notNull()
      .references(() => referencesTable.id, { onDelete: "cascade" }),

    pageNumber: text("page_number"),
    location: text("location"),
    quote: text("quote"),
    summary: text("summary"),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),

    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    unique("unique_note_reference").on(t.noteId, t.referenceId),
  ],
);

export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  noteId: text("note_id")
    .references(() => notes.id, { onDelete: "set null" }),

  title: text("title").notNull(),
  description: text("description"),

  status: text("status", {
    enum: ["todo", "in_progress", "awaiting", "done", "archived"],
  }).notNull().default("todo"),

  priority: text("priority", {
    enum: ["low", "medium", "high"],
  }).default("medium"),

  dueDate: text("due_date"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const events = sqliteTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  noteId: text("note_id").references(() => notes.id, { onDelete: "set null" }),

  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),

  title: text("title").notNull(),
  description: text("description"),

  startDate: text("start_date").notNull(),
  endDate: text("end_date"),

  allDay: integer("all_day", { mode: "boolean" }).notNull().default(true),

  location: text("location"),

  status: text("status", {
    enum: ["planned", "done", "cancelled"],
  })
    .notNull()
    .default("planned"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export type Note = typeof notes.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type NoteTag = typeof noteTags.$inferSelect;
export type NoteLink = typeof noteLinks.$inferSelect;
export type User = typeof users.$inferSelect;
export type Reference = typeof referencesTable.$inferSelect;
export type NewReference = typeof referencesTable.$inferInsert;

export type NoteReference = typeof noteReferences.$inferSelect;
export type NewNoteReference = typeof noteReferences.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;