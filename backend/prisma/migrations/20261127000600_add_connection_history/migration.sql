CREATE TABLE `connection_logins` (
    `login_key` CHAR(64) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `ended_at` DATETIME(3) NULL,
    INDEX `connection_logins_user_id_idx` (`user_id`),
    PRIMARY KEY (`login_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_app_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `login_key` CHAR(64) NOT NULL,
    `client_session_id` CHAR(36) NOT NULL,
    `active_key` VARCHAR(110) NULL,
    `connection_key` CHAR(36) NOT NULL,
    `connected_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_seen_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `disconnected_at` DATETIME(3) NULL,
    `ended_at` DATETIME(3) NULL,
    `connection_count` INTEGER NOT NULL DEFAULT 1,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(1000) NULL,
    UNIQUE INDEX `user_app_sessions_active_key_key` (`active_key`),
    INDEX `user_app_sessions_login_key_connected_at_idx` (`login_key`, `connected_at`),
    INDEX `user_app_sessions_ended_at_last_seen_at_idx` (`ended_at`, `last_seen_at`),
    INDEX `user_app_sessions_connected_at_id_idx` (`connected_at`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `connection_logins` ADD CONSTRAINT `connection_logins_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_app_sessions` ADD CONSTRAINT `user_app_sessions_login_key_fkey` FOREIGN KEY (`login_key`) REFERENCES `connection_logins`(`login_key`) ON DELETE CASCADE ON UPDATE CASCADE;
