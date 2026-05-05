PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_captures` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`raw_text` text NOT NULL,
	`summary` text,
	`analysis_json` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_captures`("id", "user_id", "raw_text", "summary", "analysis_json", "status", "created_at", "updated_at") SELECT "id", "user_id", "raw_text", "summary", "analysis_json", "status", "created_at", "updated_at" FROM `captures`;--> statement-breakpoint
DROP TABLE `captures`;--> statement-breakpoint
ALTER TABLE `__new_captures` RENAME TO `captures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;