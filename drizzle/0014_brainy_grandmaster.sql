PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_user_id` text NOT NULL,
	`scope_type` text DEFAULT 'user' NOT NULL,
	`scope_id` text NOT NULL,
	`color` text DEFAULT 'blue' NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tags`("id", "created_by_user_id", "scope_type", "scope_id", "color", "name", "slug", "visibility", "created_at", "updated_at", "deleted_at") SELECT "id", "created_by_user_id", "scope_type", "scope_id", "color", "name", "slug", "visibility", "created_at", "updated_at", "deleted_at" FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_tag_scope_slug` ON `tags` (`scope_type`,`scope_id`,`slug`);--> statement-breakpoint
ALTER TABLE `projects` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` integer NOT NULL;