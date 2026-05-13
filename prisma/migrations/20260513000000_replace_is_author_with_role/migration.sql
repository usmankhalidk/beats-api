-- Add `role` column with default 'user'
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'user';

-- Backfill: existing authors become producers
UPDATE `users` SET `role` = 'producer' WHERE `is_author` = 1;

-- Drop legacy `is_author` boolean column
ALTER TABLE `users` DROP COLUMN `is_author`;
