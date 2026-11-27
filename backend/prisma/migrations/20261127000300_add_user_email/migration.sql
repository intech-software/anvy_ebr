ALTER TABLE `users`
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD UNIQUE INDEX `users_email_key` (`email`);
