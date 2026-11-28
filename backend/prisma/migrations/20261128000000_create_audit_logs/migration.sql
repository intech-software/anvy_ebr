CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `entity_name` VARCHAR(255) NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `actor_id` INTEGER NOT NULL,
    `actor_name` VARCHAR(255) NULL,
    `reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `audit_logs_created_at_id_idx` (`created_at`, `id`),
    INDEX `audit_logs_actor_id_created_at_id_idx` (`actor_id`, `created_at`, `id`),
    INDEX `audit_logs_entity_type_created_at_id_idx` (`entity_type`, `created_at`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
