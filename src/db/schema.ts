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
  "project",
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
  "depends_on",
  "duplicates",
  "is_duplicate_of",
  "references",
  "extends",
] as const;

export const visibilityTypes = ["private", "shared", "public"] as const;
export type VisibilityType = (typeof visibilityTypes)[number];

export const ownerTypes = ["user", "project"] as const;
export type OwnerType = (typeof ownerTypes)[number];

export const projectRoles = [
  "owner",
  "manager",
  "editor",
  "contributor",
  "viewer",
] as const;

export type ProjectRole = (typeof projectRoles)[number];

export const projectPermissions = [
  "read_project",
  "update_project",
  "invite_members",
  "remove_members",
  "manage_permissions",
  "create_items",
  "link_items",
  "unlink_items",
  "edit_own_items",
  "edit_any_items",
  "delete_own_items",
  "delete_any_items",
  "comment",
  "tag_items",
  "manage_project_tags",
  "export_project",
] as const;

export type ProjectPermission = (typeof projectPermissions)[number];

export type RelationshipType = (typeof relationshipTypes)[number];

export const tagScopeTypes = ["user", "project", "public"] as const;
export type TagScopeType = (typeof tagScopeTypes)[number];

// SCHEMA_VERSION = 1;

export const notes = sqliteTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  title: text("title").notNull(),
  content: text("content"),
  contentJson: text("content_json"),

  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  ownerType: text("owner_type", {
    enum: ownerTypes,
  })
    .notNull()
    .default("user"),

  ownerId: text("owner_id").notNull(),

  visibility: text("visibility", {
    enum: visibilityTypes,
  })
    .notNull()
    .default("private"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),

  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const tags = sqliteTable(
  "tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    scopeType: text("scope_type", {
      enum: tagScopeTypes,
    })
      .notNull()
      .default("user"),

    scopeId: text("scope_id").notNull(),
    color: text("color", {
      enum: [
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
      ],
    })
      .notNull()
      .default("blue"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),

    visibility: text("visibility", {
      enum: visibilityTypes,
    })
      .notNull()
      .default("private"),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [unique("unique_tag_scope_slug").on(t.scopeType, t.scopeId, t.slug)],
);

export const entityTags = sqliteTable(
  "entity_tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    appliedByUserId: text("applied_by_user_id")
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
  (t) => [unique("unique_entity_tag").on(t.entityType, t.entityId, t.tagId)],
);

export const entityLinks = sqliteTable(
  "entity_links",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    createdByUserId: text("created_by_user_id")
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

    metadata: text("metadata"),

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
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const projects = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  title: text("title").notNull(),

  description: text("description"),

  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  visibility: text("visibility", {
    enum: visibilityTypes,
  })
    .notNull()
    .default("private"),
  status: text("status", {
    enum: ["active", "paused", "completed", "archived"],
  })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),

  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const projectMembers = sqliteTable(
  "project_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    role: text("role", {
      enum: projectRoles,
    })
      .notNull()
      .default("viewer"),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique("unique_project_member").on(t.projectId, t.userId)],
);

export const projectMemberPermissions = sqliteTable(
  "project_member_permissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    projectMemberId: text("project_member_id")
      .notNull()
      .references(() => projectMembers.id, { onDelete: "cascade" }),

    permission: text("permission", {
      enum: projectPermissions,
    }).notNull(),
  },
  (t) => [
    unique("unique_project_member_permission").on(
      t.projectMemberId,
      t.permission,
    ),
  ],
);

export const projectItems = sqliteTable(
  "project_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    entityType: text("entity_type", {
      enum: entityTypes,
    }).notNull(),

    entityId: text("entity_id").notNull(),

    addedByUserId: text("added_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    projectRole: text("project_role", {
      enum: ["source", "working", "completed", "reference"],
    })
      .notNull()
      .default("working"),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    removedAt: integer("removed_at", { mode: "timestamp" }),
  },
  (t) => [
    unique("unique_project_item").on(t.projectId, t.entityType, t.entityId),
  ],
);

export const referencesTable = sqliteTable("references", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  ownerType: text("owner_type", {
    enum: ownerTypes,
  })
    .notNull()
    .default("user"),

  ownerId: text("owner_id").notNull(),

  visibility: text("visibility", {
    enum: visibilityTypes,
  })
    .notNull()
    .default("private"),

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
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  ownerType: text("owner_type", {
    enum: ownerTypes,
  })
    .notNull()
    .default("user"),

  ownerId: text("owner_id").notNull(),

  visibility: text("visibility", {
    enum: visibilityTypes,
  })
    .notNull()
    .default("private"),

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
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const events = sqliteTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  ownerType: text("owner_type", {
    enum: ownerTypes,
  })
    .notNull()
    .default("user"),

  ownerId: text("owner_id").notNull(),

  visibility: text("visibility", {
    enum: visibilityTypes,
  })
    .notNull()
    .default("private"),

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
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const captures = sqliteTable("captures", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  ownerType: text("owner_type", {
    enum: ownerTypes,
  })
    .notNull()
    .default("user"),

  ownerId: text("owner_id").notNull(),

  visibility: text("visibility", {
    enum: visibilityTypes,
  })
    .notNull()
    .default("private"),

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
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type Note = typeof notes.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type EntityTag = typeof entityTags.$inferSelect;
export type NewEntityTag = typeof entityTags.$inferInsert;

export type EntityLink = typeof entityLinks.$inferSelect;
export type NewEntityLink = typeof entityLinks.$inferInsert;
export type User = typeof users.$inferSelect;
export type Reference = typeof referencesTable.$inferSelect;
export type NewReference = typeof referencesTable.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Capture = typeof captures.$inferSelect;
export type NewCapture = typeof captures.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;

export type ProjectMemberPermission =
  typeof projectMemberPermissions.$inferSelect;
export type NewProjectMemberPermission =
  typeof projectMemberPermissions.$inferInsert;

export type ProjectItem = typeof projectItems.$inferSelect;
export type NewProjectItem = typeof projectItems.$inferInsert;