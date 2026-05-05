ALTER TABLE `users` ADD `clerk_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `email` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);