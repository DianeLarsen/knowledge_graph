CREATE TABLE `project_items` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`added_by_user_id` text NOT NULL,
	`project_role` text DEFAULT 'working' NOT NULL,
	`created_at` integer NOT NULL,
	`removed_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_project_item` ON `project_items` (`project_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `project_member_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_member_id` text NOT NULL,
	`permission` text NOT NULL,
	FOREIGN KEY (`project_member_id`) REFERENCES `project_members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_project_member_permission` ON `project_member_permissions` (`project_member_id`,`permission`);--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_project_member` ON `project_members` (`project_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_by_user_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_captures` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_user_id` text NOT NULL,
	`owner_type` text DEFAULT 'user' NOT NULL,
	`owner_id` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`raw_text` text NOT NULL,
	`summary` text,
	`analysis_json` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_captures`("id", "created_by_user_id", "owner_type", "owner_id", "visibility", "raw_text", "summary", "analysis_json", "status", "created_at", "updated_at") SELECT "id", "created_by_user_id", "owner_type", "owner_id", "visibility", "raw_text", "summary", "analysis_json", "status", "created_at", "updated_at" FROM `captures`;--> statement-breakpoint
DROP TABLE `captures`;--> statement-breakpoint
ALTER TABLE `__new_captures` RENAME TO `captures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_entity_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_user_id` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`relationship_type` text DEFAULT 'related' NOT NULL,
	`label` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "no_self_entity_link" CHECK(NOT ("__new_entity_links"."source_type" = "__new_entity_links"."target_type" AND "__new_entity_links"."source_id" = "__new_entity_links"."target_id"))
);
--> statement-breakpoint
INSERT INTO `__new_entity_links`("id", "created_by_user_id", "source_type", "source_id", "target_type", "target_id", "relationship_type", "label", "created_at") SELECT "id", "created_by_user_id", "source_type", "source_id", "target_type", "target_id", "relationship_type", "label", "created_at" FROM `entity_links`;--> statement-breakpoint
DROP TABLE `entity_links`;--> statement-breakpoint
ALTER TABLE `__new_entity_links` RENAME TO `entity_links`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_entity_link` ON `entity_links` (`source_type`,`source_id`,`target_type`,`target_id`,`relationship_type`);--> statement-breakpoint
CREATE TABLE `__new_entity_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`applied_by_user_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`applied_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_entity_tags`("id", "applied_by_user_id", "entity_type", "entity_id", "tag_id", "created_at") SELECT "id", "applied_by_user_id", "entity_type", "entity_id", "tag_id", "created_at" FROM `entity_tags`;--> statement-breakpoint
DROP TABLE `entity_tags`;--> statement-breakpoint
ALTER TABLE `__new_entity_tags` RENAME TO `entity_tags`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_entity_tag` ON `entity_tags` (`entity_type`,`entity_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_user_id` text NOT NULL,
	`owner_type` text DEFAULT 'user' NOT NULL,
	`owner_id` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`note_id` text,
	`task_id` text,
	`title` text NOT NULL,
	`description` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`start_time` text,
	`end_time` text,
	`all_day` integer DEFAULT true NOT NULL,
	`location` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "created_by_user_id", "owner_type", "owner_id", "visibility", "note_id", "task_id", "title", "description", "start_date", "end_date", "start_time", "end_time", "all_day", "location", "status", "created_at", "updated_at") SELECT "id", "created_by_user_id", "owner_type", "owner_id", "visibility", "note_id", "task_id", "title", "description", "start_date", "end_date", "start_time", "end_time", "all_day", "location", "status", "created_at", "updated_at" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`content_json` text,
	`created_by_user_id` text NOT NULL,
	`owner_type` text DEFAULT 'user' NOT NULL,
	`owner_id` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notes`("id", "title", "content", "content_json", "created_by_user_id", "owner_type", "owner_id", "visibility", "created_at", "updated_at", "deleted_at") SELECT "id", "title", "content", "content_json", "created_by_user_id", "owner_type", "owner_id", "visibility", "created_at", "updated_at", "deleted_at" FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;--> statement-breakpoint
CREATE TABLE `__new_references` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_user_id` text NOT NULL,
	`owner_type` text DEFAULT 'user' NOT NULL,
	`owner_id` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`url` text,
	`publisher` text,
	`published_date` text,
	`citation` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_references`("id", "created_by_user_id", "owner_type", "owner_id", "visibility", "type", "title", "author", "url", "publisher", "published_date", "citation", "notes", "created_at", "updated_at") SELECT "id", "created_by_user_id", "owner_type", "owner_id", "visibility", "type", "title", "author", "url", "publisher", "published_date", "citation", "notes", "created_at", "updated_at" FROM `references`;--> statement-breakpoint
DROP TABLE `references`;--> statement-breakpoint
ALTER TABLE `__new_references` RENAME TO `references`;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_user_id` text NOT NULL,
	`owner_type` text DEFAULT 'user' NOT NULL,
	`owner_id` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`note_id` text,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text DEFAULT 'medium',
	`due_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "created_by_user_id", "owner_type", "owner_id", "visibility", "note_id", "title", "description", "status", "priority", "due_date", "created_at", "updated_at") SELECT "id", "created_by_user_id", "owner_type", "owner_id", "visibility", "note_id", "title", "description", "status", "priority", "due_date", "created_at", "updated_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
DROP INDEX `tags_name_unique`;--> statement-breakpoint
ALTER TABLE `tags` ADD `created_by_user_id` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `tags` ADD `scope_type` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` ADD `scope_id` text;--> statement-breakpoint
ALTER TABLE `tags` ADD `slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` ADD `visibility` text DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_tag_scope_slug` ON `tags` (`scope_type`,`scope_id`,`slug`);