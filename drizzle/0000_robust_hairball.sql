CREATE TABLE `note_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`source_note_id` text NOT NULL,
	`target_note_id` text NOT NULL,
	`relationship_type` text NOT NULL,
	FOREIGN KEY (`source_note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "no_self_link" CHECK("note_links"."source_note_id" <> "note_links"."target_note_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_note_link` ON `note_links` (`source_note_id`,`target_note_id`,`relationship_type`);--> statement-breakpoint
CREATE TABLE `note_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`note_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_note_tag` ON `note_tags` (`note_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);