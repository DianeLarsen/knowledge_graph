DROP TABLE `note_reference_details`;--> statement-breakpoint
ALTER TABLE `note_references` ADD `page_number` text;--> statement-breakpoint
ALTER TABLE `note_references` ADD `location` text;--> statement-breakpoint
ALTER TABLE `note_references` ADD `quote` text;--> statement-breakpoint
ALTER TABLE `note_references` ADD `summary` text;--> statement-breakpoint
ALTER TABLE `note_references` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `references` ADD `publisher` text;--> statement-breakpoint
ALTER TABLE `references` ADD `published_date` text;