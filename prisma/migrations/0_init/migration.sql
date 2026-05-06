-- CreateTable
CREATE TABLE `addons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `version` VARCHAR(255) NOT NULL,
    `thumbnail` VARCHAR(255) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `action` VARCHAR(255) NULL,
    `status` BOOLEAN NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `addons_alias_unique`(`alias` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NULL,
    `image` VARCHAR(255) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_password_resets` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `admin_password_resets_email_index`(`email` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(255) NULL,
    `lastname` VARCHAR(255) NULL,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `google2fa_status` BOOLEAN NOT NULL DEFAULT false,
    `google2fa_secret` TEXT NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `admins_email_unique`(`email` ASC),
    UNIQUE INDEX `admins_username_unique`(`username` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ads` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `alias` VARCHAR(255) NOT NULL,
    `position` VARCHAR(255) NOT NULL,
    `size` VARCHAR(255) NULL,
    `code` LONGTEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `author_taxes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `rate` INTEGER UNSIGNED NOT NULL,
    `countries` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NULL,
    `image` VARCHAR(255) NOT NULL,
    `country` VARCHAR(10) NULL,
    `level_id` BIGINT UNSIGNED NULL,
    `membership_years` BIGINT NULL,
    `is_permanent` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `badges_country_unique`(`country` ASC),
    UNIQUE INDEX `badges_level_id_unique`(`level_id` ASC),
    UNIQUE INDEX `badges_membership_years_unique`(`membership_years` ASC),
    UNIQUE INDEX `badges_name_unique`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_articles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `short_description` VARCHAR(200) NOT NULL,
    `blog_category_id` BIGINT UNSIGNED NOT NULL,
    `views` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `blog_articles_blog_category_id_foreign`(`blog_category_id` ASC),
    UNIQUE INDEX `blog_articles_slug_unique`(`slug` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `views` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `blog_categories_slug_unique`(`slug` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `blog_article_id` BIGINT UNSIGNED NOT NULL,
    `body` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `blog_comments_blog_article_id_foreign`(`blog_article_id` ASC),
    INDEX `blog_comments_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bottom_nav_links` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `link_type` BOOLEAN NOT NULL DEFAULT true,
    `parent_id` BIGINT UNSIGNED NULL,
    `order` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `bottom_nav_links_parent_id_foreign`(`parent_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buyer_taxes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `rate` INTEGER UNSIGNED NOT NULL,
    `countries` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `captcha_providers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `logo` VARCHAR(255) NOT NULL,
    `settings` LONGTEXT NOT NULL,
    `instructions` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `session_id` VARCHAR(255) NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `license_type` TINYINT NOT NULL DEFAULT 1,
    `quantity` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `support_period_id` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `cart_items_item_id_foreign`(`item_id` ASC),
    INDEX `cart_items_support_period_id_foreign`(`support_period_id` ASC),
    INDEX `cart_items_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `regular_buyer_fee` DOUBLE NULL DEFAULT 0,
    `extended_buyer_fee` DOUBLE NULL DEFAULT 0,
    `file_type` BOOLEAN NULL,
    `thumbnail_width` BIGINT UNSIGNED NOT NULL DEFAULT 120,
    `thumbnail_height` BIGINT UNSIGNED NOT NULL DEFAULT 120,
    `preview_image_width` BIGINT UNSIGNED NULL,
    `preview_image_height` BIGINT UNSIGNED NULL,
    `maximum_screenshots` BIGINT UNSIGNED NULL,
    `main_file_types` VARCHAR(255) NOT NULL DEFAULT 'zip,rar,pdf',
    `max_preview_file_size` BIGINT UNSIGNED NOT NULL DEFAULT 10485760,
    `views` BIGINT NOT NULL DEFAULT 0,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `categories_slug_unique`(`slug` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_options` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `type` TINYINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `options` LONGTEXT NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `category_options_category_id_foreign`(`category_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_reviewer` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `reviewer_id` BIGINT UNSIGNED NOT NULL,

    INDEX `category_reviewer_category_id_foreign`(`category_id` ASC),
    INDEX `category_reviewer_reviewer_id_foreign`(`reviewer_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currencies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NOT NULL,
    `symbol` VARCHAR(255) NOT NULL,
    `position` TINYINT NOT NULL DEFAULT 1,
    `rate` DECIMAL(28, 9) NOT NULL,
    `icon` VARCHAR(255) NOT NULL,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `currencies_code_unique`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `editor_images` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `extensions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `logo` VARCHAR(255) NOT NULL,
    `settings` LONGTEXT NOT NULL,
    `instructions` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `failed_jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(255) NOT NULL,
    `connection` TEXT NOT NULL,
    `queue` TEXT NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `exception` LONGTEXT NOT NULL,
    `failed_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `failed_jobs_uuid_unique`(`uuid` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `favorites_item_id_foreign`(`item_id` ASC),
    INDEX `favorites_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `followers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `follower_id` BIGINT UNSIGNED NOT NULL,
    `following_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `followers_follower_id_foreign`(`follower_id` ASC),
    INDEX `followers_following_id_foreign`(`following_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `footer_links` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `link_type` BOOLEAN NOT NULL DEFAULT true,
    `parent_id` BIGINT UNSIGNED NULL,
    `order` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `footer_links_parent_id_foreign`(`parent_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `help_articles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `short_description` VARCHAR(200) NOT NULL,
    `views` BIGINT NOT NULL DEFAULT 0,
    `likes` BIGINT NOT NULL DEFAULT 0,
    `dislikes` BIGINT NOT NULL DEFAULT 0,
    `help_category_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `help_articles_help_category_id_foreign`(`help_category_id` ASC),
    UNIQUE INDEX `help_articles_slug_unique`(`slug` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `help_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `views` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `help_categories_slug_unique`(`slug` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_sections` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `items_number` INTEGER NULL,
    `cache_expiry_time` INTEGER UNSIGNED NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `sort_id` BIGINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_change_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `version` VARCHAR(255) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_change_logs_item_id_foreign`(`item_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_comment_replies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_comment_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `body` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_comment_replies_item_comment_id_foreign`(`item_comment_id` ASC),
    INDEX `item_comment_replies_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_comment_reports` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `item_comment_reply_id` BIGINT UNSIGNED NOT NULL,
    `reason` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_comment_reports_item_comment_reply_id_foreign`(`item_comment_reply_id` ASC),
    INDEX `item_comment_reports_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_comments_author_id_foreign`(`author_id` ASC),
    INDEX `item_comments_item_id_foreign`(`item_id` ASC),
    INDEX `item_comments_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_discounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `regular_percentage` INTEGER UNSIGNED NOT NULL,
    `regular_price` DOUBLE NOT NULL,
    `extended_percentage` INTEGER UNSIGNED NULL,
    `extended_price` DOUBLE NULL,
    `starting_at` DATE NOT NULL,
    `ending_at` DATE NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_discounts_item_id_foreign`(`item_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_histories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NULL,
    `reviewer_id` BIGINT UNSIGNED NULL,
    `admin_id` BIGINT UNSIGNED NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_histories_ author_id_foreign`(`author_id` ASC),
    INDEX `item_histories_admin_id_foreign`(`admin_id` ASC),
    INDEX `item_histories_item_id_foreign`(`item_id` ASC),
    INDEX `item_histories_reviewer_id_foreign`(`reviewer_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_review_replies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_review_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `body` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_review_replies_item_review_id_foreign`(`item_review_id` ASC),
    INDEX `item_review_replies_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `stars` INTEGER NOT NULL,
    `subject` VARCHAR(100) NOT NULL,
    `body` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_reviews_author_id_foreign`(`author_id` ASC),
    INDEX `item_reviews_item_id_foreign`(`item_id` ASC),
    INDEX `item_reviews_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_updates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `sub_category_id` BIGINT UNSIGNED NULL,
    `options` LONGTEXT NULL,
    `version` VARCHAR(255) NULL,
    `demo_link` TEXT NULL,
    `tags` LONGTEXT NOT NULL,
    `thumbnail` VARCHAR(255) NULL,
    `preview_type` VARCHAR(255) NOT NULL DEFAULT 'image',
    `preview_image` VARCHAR(255) NULL,
    `preview_video` VARCHAR(255) NULL,
    `preview_audio` VARCHAR(255) NULL,
    `main_file` VARCHAR(255) NULL,
    `is_main_file_external` BOOLEAN NOT NULL DEFAULT false,
    `screenshots` LONGTEXT NULL,
    `regular_price` DOUBLE NULL,
    `extended_price` DOUBLE NULL,
    `is_supported` BOOLEAN NULL DEFAULT false,
    `support_instructions` TEXT NULL,
    `purchasing_status` BOOLEAN NOT NULL DEFAULT true,
    `is_free` BOOLEAN NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_updates_ author_id_foreign`(`author_id` ASC),
    INDEX `item_updates_category_id_foreign`(`category_id` ASC),
    INDEX `item_updates_item_id_foreign`(`item_id` ASC),
    UNIQUE INDEX `item_updates_name_unique`(`name` ASC),
    INDEX `item_updates_sub_category_id_foreign`(`sub_category_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_views` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `ip` VARCHAR(255) NOT NULL,
    `referrer` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `item_views_item_id_foreign`(`item_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `sub_category_id` BIGINT UNSIGNED NULL,
    `options` LONGTEXT NULL,
    `version` VARCHAR(255) NULL,
    `demo_link` TEXT NULL,
    `tags` LONGTEXT NOT NULL,
    `thumbnail` VARCHAR(255) NULL,
    `preview_type` VARCHAR(255) NOT NULL DEFAULT 'image',
    `preview_image` VARCHAR(255) NULL,
    `preview_video` VARCHAR(255) NULL,
    `preview_audio` VARCHAR(255) NULL,
    `main_file` VARCHAR(255) NOT NULL,
    `is_main_file_external` BOOLEAN NOT NULL DEFAULT false,
    `screenshots` LONGTEXT NULL,
    `regular_price` DOUBLE NOT NULL,
    `extended_price` DOUBLE NOT NULL,
    `is_supported` BOOLEAN NULL DEFAULT false,
    `support_instructions` TEXT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `total_sales` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `total_sales_amount` DOUBLE NULL DEFAULT 0,
    `total_earnings` DOUBLE NULL DEFAULT 0,
    `total_reviews` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `avg_reviews` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `total_comments` BIGINT NOT NULL DEFAULT 0,
    `total_views` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `current_month_views` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `free_downloads` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `purchasing_status` BOOLEAN NOT NULL DEFAULT true,
    `is_premium` BOOLEAN NOT NULL DEFAULT false,
    `is_free` BOOLEAN NULL DEFAULT false,
    `is_trending` BOOLEAN NOT NULL DEFAULT false,
    `is_best_selling` BOOLEAN NOT NULL DEFAULT false,
    `is_on_discount` BOOLEAN NOT NULL DEFAULT false,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `was_featured` BOOLEAN NOT NULL DEFAULT false,
    `last_update_at` DATETIME(0) NULL,
    `last_discount_at` DATETIME(0) NULL,
    `price_updated_at` DATETIME(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `items_ author_id_foreign`(`author_id` ASC),
    INDEX `items_category_id_foreign`(`category_id` ASC),
    UNIQUE INDEX `items_name_unique`(`name` ASC),
    UNIQUE INDEX `items_slug_unique`(`slug` ASC),
    INDEX `items_sub_category_id_foreign`(`sub_category_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `queue` VARCHAR(255) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `attempts` TINYINT UNSIGNED NOT NULL,
    `reserved_at` INTEGER UNSIGNED NULL,
    `available_at` INTEGER UNSIGNED NOT NULL,
    `created_at` INTEGER UNSIGNED NOT NULL,

    INDEX `jobs_queue_index`(`queue` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kyc_verifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `document_type` ENUM('national_id', 'passport') NOT NULL,
    `document_number` VARCHAR(30) NOT NULL,
    `documents` VARCHAR(255) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `rejection_reason` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `kyc_verifications_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `levels` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `min_earnings` BIGINT UNSIGNED NOT NULL,
    `fees` INTEGER NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `levels_min_earnings_unique`(`min_earnings` ASC),
    UNIQUE INDEX `levels_name_unique`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mail_templates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `alias` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `shortcodes` LONGTEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migrations` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INTEGER NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oauth_providers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `logo` VARCHAR(255) NOT NULL,
    `credentials` LONGTEXT NOT NULL,
    `instructions` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `short_description` VARCHAR(200) NOT NULL,
    `views` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `pages_slug_unique`(`slug` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `password_resets_email_index`(`email` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_gateways` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `logo` VARCHAR(255) NOT NULL,
    `fees` INTEGER NOT NULL DEFAULT 0,
    `charge_currency` VARCHAR(255) NULL,
    `charge_rate` DECIMAL(28, 9) NULL,
    `credentials` LONGTEXT NULL,
    `parameters` LONGTEXT NULL,
    `is_manual` BOOLEAN NOT NULL DEFAULT false,
    `instructions` LONGTEXT NULL,
    `mode` ENUM('sandbox', 'live') NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `interval` ENUM('week', 'month', 'year', 'lifetime') NOT NULL,
    `price` DOUBLE NULL,
    `author_earning_percentage` VARCHAR(10) NOT NULL DEFAULT '0',
    `downloads` BIGINT UNSIGNED NULL,
    `custom_features` LONGTEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `sort_id` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `premium_earnings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `subscription_id` BIGINT UNSIGNED NULL,
    `item_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(255) NOT NULL,
    `percentage` VARCHAR(255) NOT NULL,
    `price` DOUBLE NOT NULL,
    `author_earning` DOUBLE NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `premium_earnings_author_id_foreign`(`author_id` ASC),
    INDEX `premium_earnings_item_id_foreign`(`item_id` ASC),
    INDEX `premium_earnings_subscription_id_foreign`(`subscription_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchases` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `sale_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `license_type` BOOLEAN NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `support_expiry_at` DATETIME(0) NULL,
    `is_downloaded` BOOLEAN NOT NULL DEFAULT false,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `purchases_author_id_foreign`(`author_id` ASC),
    UNIQUE INDEX `purchases_code_unique`(`code` ASC),
    INDEX `purchases_item_id_foreign`(`item_id` ASC),
    INDEX `purchases_sale_id_foreign`(`sale_id` ASC),
    INDEX `purchases_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_earnings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `referral_id` BIGINT UNSIGNED NOT NULL,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `sale_id` BIGINT UNSIGNED NOT NULL,
    `author_earning` DOUBLE NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `referral_earnings_author_id_foreign`(`author_id` ASC),
    INDEX `referral_earnings_referral_id_foreign`(`referral_id` ASC),
    INDEX `referral_earnings_sale_id_foreign`(`sale_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referrals` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `earnings` DOUBLE NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `referrals_author_id_foreign`(`author_id` ASC),
    INDEX `referrals_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refund_replies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `refund_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `body` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `refund_replies_refund_id_foreign`(`refund_id` ASC),
    INDEX `refund_replies_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `purchase_id` BIGINT UNSIGNED NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `refunds_author_id_foreign`(`author_id` ASC),
    INDEX `refunds_purchase_id_foreign`(`purchase_id` ASC),
    INDEX `refunds_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviewer_password_resets` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `reviewer_password_resets_email_index`(`email` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviewers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `google2fa_status` BOOLEAN NOT NULL DEFAULT false,
    `google2fa_secret` TEXT NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `reviewers_email_unique`(`email` ASC),
    UNIQUE INDEX `reviewers_username_unique`(`username` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NOT NULL,
    `license_type` BOOLEAN NOT NULL,
    `price` DOUBLE NOT NULL,
    `buyer_fee` DOUBLE NULL DEFAULT 0,
    `buyer_tax` TEXT NULL,
    `author_fee` DOUBLE NULL DEFAULT 0,
    `author_tax` TEXT NULL,
    `author_earning` DOUBLE NULL DEFAULT 0,
    `country` VARCHAR(10) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `sales_author_id_foreign`(`author_id` ASC),
    INDEX `sales_item_id_foreign`(`item_id` ASC),
    INDEX `sales_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `buyer_fee` DOUBLE NULL DEFAULT 0,
    `author_fee` DOUBLE NULL DEFAULT 0,
    `tax` TEXT NULL,
    `total` DOUBLE NULL,
    `type` TINYINT NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `statements_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `storage_providers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `processor` VARCHAR(255) NOT NULL,
    `credentials` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(70) NULL,
    `description` VARCHAR(150) NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `views` BIGINT NOT NULL DEFAULT 0,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `sub_categories_category_id_foreign`(`category_id` ASC),
    UNIQUE INDEX `sub_categories_slug_unique`(`slug` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `plan_id` BIGINT UNSIGNED NOT NULL,
    `total_downloads` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `expiry_at` DATETIME(0) NULL,
    `last_notification_at` DATETIME(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `subscriptions_plan_id_foreign`(`plan_id` ASC),
    INDEX `subscriptions_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_earnings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `purchase_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `days` BIGINT UNSIGNED NOT NULL,
    `price` DOUBLE NOT NULL,
    `buyer_tax` TEXT NULL,
    `author_fee` DOUBLE NULL DEFAULT 0,
    `author_tax` TEXT NULL,
    `author_earning` DOUBLE NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `support_expiry_at` DATETIME(0) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `support_earnings_author_id_foreign`(`author_id` ASC),
    INDEX `support_earnings_purchase_id_foreign`(`purchase_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_periods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `days` BIGINT UNSIGNED NOT NULL,
    `percentage` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `support_periods_name_unique`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `themes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `version` VARCHAR(255) NOT NULL,
    `preview_image` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `themes_alias_unique`(`alias` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `ticket_categories_name_unique`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_replies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `body` LONGTEXT NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `admin_id` BIGINT UNSIGNED NULL,
    `ticket_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `ticket_replies_admin_id_foreign`(`admin_id` ASC),
    INDEX `ticket_replies_ticket_id_foreign`(`ticket_id` ASC),
    INDEX `ticket_replies_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_reply_attachments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `ticket_reply_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `ticket_reply_attachments_ticket_reply_id_foreign`(`ticket_reply_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `ticket_category_id` BIGINT UNSIGNED NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `tickets_ticket_category_id_foreign`(`ticket_category_id` ASC),
    INDEX `tickets_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `top_nav_links` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `link_type` BOOLEAN NOT NULL DEFAULT true,
    `parent_id` BIGINT UNSIGNED NULL,
    `order` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `top_nav_links_parent_id_foreign`(`parent_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `transaction_id` BIGINT UNSIGNED NOT NULL,
    `item_id` BIGINT UNSIGNED NULL,
    `license_type` TINYINT NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `total` DOUBLE NOT NULL,
    `support` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `transaction_items_item_id_foreign`(`item_id` ASC),
    INDEX `transaction_items_transaction_id_foreign`(`transaction_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `amount` DOUBLE NOT NULL,
    `fees` DOUBLE NULL DEFAULT 0,
    `tax` TEXT NULL,
    `total` DOUBLE NOT NULL,
    `payment_gateway_id` BIGINT UNSIGNED NULL,
    `payment_id` VARCHAR(255) NULL,
    `payer_id` VARCHAR(255) NULL,
    `payer_email` VARCHAR(255) NULL,
    `payment_proof` VARCHAR(255) NULL,
    `type` ENUM('purchase', 'support_purchase', 'support_extend', 'deposit', 'subscription') NOT NULL,
    `support` LONGTEXT NULL,
    `purchase_id` BIGINT UNSIGNED NULL,
    `plan_id` BIGINT UNSIGNED NULL,
    `status` TINYINT NOT NULL DEFAULT 0,
    `cancellation_reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `transactions_payment_gateway_id_foreign`(`payment_gateway_id` ASC),
    INDEX `transactions_plan_id_foreign`(`plan_id` ASC),
    INDEX `transactions_purchase_id_foreign`(`purchase_id` ASC),
    INDEX `transactions_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `translates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` TEXT NOT NULL,
    `value` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploaded_files` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(255) NOT NULL,
    `extension` VARCHAR(255) NOT NULL,
    `size` BIGINT UNSIGNED NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `expiry_at` DATETIME(0) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `uploaded_files_author_id_foreign`(`author_id` ASC),
    INDEX `uploaded_files_category_id_foreign`(`category_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `badge_id` BIGINT UNSIGNED NOT NULL,
    `badge_alias` VARCHAR(255) NOT NULL,
    `sort_id` BIGINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `user_badges_badge_id_foreign`(`badge_id` ASC),
    INDEX `user_badges_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_login_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `ip` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `country_code` VARCHAR(100) NULL,
    `timezone` VARCHAR(150) NULL,
    `location` VARCHAR(60) NULL,
    `latitude` VARCHAR(60) NULL,
    `longitude` VARCHAR(60) NULL,
    `browser` VARCHAR(60) NULL,
    `os` VARCHAR(60) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `user_login_logs_user_id_foreign`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(50) NULL,
    `lastname` VARCHAR(50) NULL,
    `username` VARCHAR(50) NULL,
    `email` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `password` VARCHAR(255) NULL,
    `api_key` VARCHAR(255) NULL,
    `is_author` BOOLEAN NOT NULL DEFAULT false,
    `is_featured_author` BOOLEAN NOT NULL DEFAULT false,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `level_id` BIGINT UNSIGNED NULL,
    `exclusivity` ENUM('exclusive', 'non_exclusive') NULL,
    `total_sales` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `total_sales_amount` DOUBLE NULL DEFAULT 0,
    `total_referrals_earnings` DOUBLE NULL DEFAULT 0,
    `total_reviews` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `avg_reviews` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `total_followers` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `total_following` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `avatar` VARCHAR(255) NULL,
    `profile_cover` VARCHAR(255) NULL,
    `profile_heading` VARCHAR(255) NULL,
    `profile_description` LONGTEXT NULL,
    `profile_contact_email` VARCHAR(255) NULL,
    `profile_social_links` TEXT NULL,
    `facebook_id` VARCHAR(255) NULL,
    `google_id` VARCHAR(255) NULL,
    `microsoft_id` VARCHAR(255) NULL,
    `vkontakte_id` VARCHAR(255) NULL,
    `envato_id` VARCHAR(255) NULL,
    `github_id` VARCHAR(255) NULL,
    `withdrawal_method_id` BIGINT UNSIGNED NULL,
    `withdrawal_account` TEXT NULL,
    `was_subscribed` BOOLEAN NOT NULL DEFAULT false,
    `email_verified_at` TIMESTAMP(0) NULL,
    `kyc_status` BOOLEAN NOT NULL DEFAULT false,
    `google2fa_status` BOOLEAN NOT NULL DEFAULT false,
    `google2fa_secret` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `envato_id`(`envato_id` ASC),
    UNIQUE INDEX `github_id`(`github_id` ASC),
    UNIQUE INDEX `microsoft_id`(`microsoft_id` ASC),
    UNIQUE INDEX `users_email_unique`(`email` ASC),
    UNIQUE INDEX `users_facebook_id_unique`(`facebook_id` ASC),
    UNIQUE INDEX `users_google_id_unique`(`google_id` ASC),
    INDEX `users_level_id_foreign`(`level_id` ASC),
    UNIQUE INDEX `users_username_unique`(`username` ASC),
    INDEX `users_withdrawal_method_id_foreign`(`withdrawal_method_id` ASC),
    UNIQUE INDEX `vkontakte_id`(`vkontakte_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `withdrawal_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `minimum` BIGINT NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `sort_id` INTEGER NOT NULL DEFAULT 0,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `withdrawal_methods_name_unique`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `withdrawals` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` VARCHAR(255) NOT NULL,
    `account` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `withdrawals_author_id_foreign`(`author_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `badges` ADD CONSTRAINT `badges_level_id_foreign` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `blog_articles` ADD CONSTRAINT `blog_articles_blog_category_id_foreign` FOREIGN KEY (`blog_category_id`) REFERENCES `blog_categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_blog_article_id_foreign` FOREIGN KEY (`blog_article_id`) REFERENCES `blog_articles`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bottom_nav_links` ADD CONSTRAINT `bottom_nav_links_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `bottom_nav_links`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_support_period_id_foreign` FOREIGN KEY (`support_period_id`) REFERENCES `support_periods`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `category_options` ADD CONSTRAINT `category_options_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `category_reviewer` ADD CONSTRAINT `category_reviewer_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `category_reviewer` ADD CONSTRAINT `category_reviewer_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `reviewers`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `followers` ADD CONSTRAINT `followers_follower_id_foreign` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `followers` ADD CONSTRAINT `followers_following_id_foreign` FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `footer_links` ADD CONSTRAINT `footer_links_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `footer_links`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `help_articles` ADD CONSTRAINT `help_articles_help_category_id_foreign` FOREIGN KEY (`help_category_id`) REFERENCES `help_categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_change_logs` ADD CONSTRAINT `item_change_logs_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_comment_replies` ADD CONSTRAINT `item_comment_replies_item_comment_id_foreign` FOREIGN KEY (`item_comment_id`) REFERENCES `item_comments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_comment_replies` ADD CONSTRAINT `item_comment_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_comment_reports` ADD CONSTRAINT `item_comment_reports_item_comment_reply_id_foreign` FOREIGN KEY (`item_comment_reply_id`) REFERENCES `item_comment_replies`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_comment_reports` ADD CONSTRAINT `item_comment_reports_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_comments` ADD CONSTRAINT `item_comments_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_comments` ADD CONSTRAINT `item_comments_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_comments` ADD CONSTRAINT `item_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_discounts` ADD CONSTRAINT `item_discounts_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_histories` ADD CONSTRAINT `item_histories_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_histories` ADD CONSTRAINT `item_histories_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_histories` ADD CONSTRAINT `item_histories_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `reviewers`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_histories` ADD CONSTRAINT `item_histories_user_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_review_replies` ADD CONSTRAINT `item_review_replies_item_review_id_foreign` FOREIGN KEY (`item_review_id`) REFERENCES `item_reviews`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_review_replies` ADD CONSTRAINT `item_review_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_reviews` ADD CONSTRAINT `item_reviews_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_reviews` ADD CONSTRAINT `item_reviews_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_reviews` ADD CONSTRAINT `item_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_updates` ADD CONSTRAINT `item_updates_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_updates` ADD CONSTRAINT `item_updates_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_updates` ADD CONSTRAINT `item_updates_sub_category_id_foreign` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_updates` ADD CONSTRAINT `item_updates_user_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_views` ADD CONSTRAINT `item_views_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_sub_category_id_foreign` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_user_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `kyc_verifications` ADD CONSTRAINT `kyc_verifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `premium_earnings` ADD CONSTRAINT `premium_earnings_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `premium_earnings` ADD CONSTRAINT `premium_earnings_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `premium_earnings` ADD CONSTRAINT `premium_earnings_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `referral_earnings` ADD CONSTRAINT `referral_earnings_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `referral_earnings` ADD CONSTRAINT `referral_earnings_referral_id_foreign` FOREIGN KEY (`referral_id`) REFERENCES `referrals`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `referral_earnings` ADD CONSTRAINT `referral_earnings_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `refund_replies` ADD CONSTRAINT `refund_replies_refund_id_foreign` FOREIGN KEY (`refund_id`) REFERENCES `refunds`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `refund_replies` ADD CONSTRAINT `refund_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `statements` ADD CONSTRAINT `statements_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sub_categories` ADD CONSTRAINT `sub_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `support_earnings` ADD CONSTRAINT `support_earnings_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `support_earnings` ADD CONSTRAINT `support_earnings_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ticket_replies` ADD CONSTRAINT `ticket_replies_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ticket_replies` ADD CONSTRAINT `ticket_replies_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ticket_replies` ADD CONSTRAINT `ticket_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ticket_reply_attachments` ADD CONSTRAINT `ticket_reply_attachments_ticket_reply_id_foreign` FOREIGN KEY (`ticket_reply_id`) REFERENCES `ticket_replies`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_ticket_category_id_foreign` FOREIGN KEY (`ticket_category_id`) REFERENCES `ticket_categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `top_nav_links` ADD CONSTRAINT `top_nav_links_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `top_nav_links`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_payment_gateway_id_foreign` FOREIGN KEY (`payment_gateway_id`) REFERENCES `payment_gateways`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `uploaded_files` ADD CONSTRAINT `uploaded_files_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `uploaded_files` ADD CONSTRAINT `uploaded_files_user_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_badge_id_foreign` FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_login_logs` ADD CONSTRAINT `user_login_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_level_id_foreign` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_withdrawal_method_id_foreign` FOREIGN KEY (`withdrawal_method_id`) REFERENCES `withdrawal_methods`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_user_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

