import {
  sqliteTable,
  text,
  integer,
  unique,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
export const entityTypes = [
  "note",
  "task",
  "event",
  "capture",
  "reference",
] as const;

export type EntityType = (typeof entityTypes)[number];

export const relationshipTypes = [
  "related",
  "created_from",
  "supports",
  "blocks",
  "mentions",
  "uses",
  "follow_up",
] as const;

export type RelationshipType = (typeof relationshipTypes)[number];
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



export const entityTags = sqliteTable(
  "entity_tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    entityType: text("entity_type", {
      enum: entityTypes,
    }).notNull(),

    entityId: text("entity_id").notNull(),

    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    unique("unique_entity_tag").on(t.userId, t.entityType, t.entityId, t.tagId),
  ],
);

export const entityLinks = sqliteTable(
  "entity_links",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    sourceType: text("source_type", {
      enum: entityTypes,
    }).notNull(),

    sourceId: text("source_id").notNull(),

    targetType: text("target_type", {
      enum: entityTypes,
    }).notNull(),

    targetId: text("target_id").notNull(),

    relationshipType: text("relationship_type", {
      enum: relationshipTypes, 
    })
      .notNull()
      .default("related"),

    label: text("label"),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    check(
      "no_self_entity_link",
      sql`NOT (${t.sourceType} = ${t.targetType} AND ${t.sourceId} = ${t.targetId})`,
    ),

    unique("unique_entity_link").on(
      t.userId,
      t.sourceType,
      t.sourceId,
      t.targetType,
      t.targetId,
      t.relationshipType,
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
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
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
  (t) => [unique("unique_note_reference").on(t.noteId, t.referenceId)],
);

export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  noteId: text("note_id").references(() => notes.id, { onDelete: "set null" }),

  title: text("title").notNull(),
  description: text("description"),

  status: text("status", {
    enum: ["todo", "in_progress", "awaiting", "done", "archived"],
  })
    .notNull()
    .default("todo"),

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
  startTime: text("start_time"),
  endTime: text("end_time"),
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

export const captures = sqliteTable("captures", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  rawText: text("raw_text").notNull(),
  summary: text("summary"),
  analysisJson: text("analysis_json"),

  status: text("status", {
    enum: ["new", "analyzed", "processed", "archived"],
  })
    .notNull()
    .default("new"),

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
export type EntityTag = typeof entityTags.$inferSelect;
export type NewEntityTag = typeof entityTags.$inferInsert;

export type EntityLink = typeof entityLinks.$inferSelect;
export type NewEntityLink = typeof entityLinks.$inferInsert;
export type User = typeof users.$inferSelect;
export type Reference = typeof referencesTable.$inferSelect;
export type NewReference = typeof referencesTable.$inferInsert;

export type NoteReference = typeof noteReferences.$inferSelect;
export type NewNoteReference = typeof noteReferences.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Capture = typeof captures.$inferSelect;
export type NewCapture = typeof captures.$inferInsert;

