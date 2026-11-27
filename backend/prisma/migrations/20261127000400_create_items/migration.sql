CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_code` VARCHAR(191) NOT NULL,
    `item_name` TEXT NOT NULL,
    `unit` VARCHAR(191) NULL,
    UNIQUE INDEX `items_item_code_key` (`item_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
