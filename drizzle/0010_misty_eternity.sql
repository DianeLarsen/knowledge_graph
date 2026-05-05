CREATE TABLE `entity_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`relationship_type` text DEFAULT 'related' NOT NULL,
	`label` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "no_self_entity_link" CHECK(NOT ("entity_links"."source_type" = "entity_links"."target_type" AND "entity_links"."source_id" = "entity_links"."target_id"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_entity_link` ON `entity_links` (`user_id`,`source_type`,`source_id`,`target_type`,`target_id`,`relationship_type`);--> statement-breakpoint
CREATE TABLE `entity_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_entity_tag` ON `entity_tags` (`user_id`,`entity_type`,`entity_id`,`tag_id`);--> statement-breakpoint
DROP TABLE `note_links`;--> statement-breakpoint
DROP TABLE `note_tags`;