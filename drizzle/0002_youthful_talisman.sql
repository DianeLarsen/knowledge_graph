CREATE TABLE `note_reference_details` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`reference_id` text NOT NULL,
	`page_number` text,
	`quote` text,
	`summary` text,
	`location` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reference_id`) REFERENCES `references`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_note_reference_detail` ON `note_reference_details` (`note_id`,`reference_id`);--> statement-breakpoint
CREATE TABLE `note_references` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`reference_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reference_id`) REFERENCES `references`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_note_reference` ON `note_references` (`note_id`,`reference_id`);--> statement-breakpoint
CREATE TABLE `references` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`url` text,
	`citation` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `notes` ADD `content_json` text;