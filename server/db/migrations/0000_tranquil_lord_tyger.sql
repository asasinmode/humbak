CREATE TABLE `contents` (
	`pageId` int NOT NULL,
	`rawHtml` text NOT NULL DEFAULT ('<section>
	<h1>Nagłówek</h1>
</section>'),
	`parsedHtml` text NOT NULL DEFAULT ('<section>
	<h1>Nagłówek</h1>
</section>'),
	`meta` json NOT NULL DEFAULT ('[{"name":"description","content":""},{"name":"abstract","content":""}]'),
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `contents_pageId` PRIMARY KEY(`pageId`)
);
--> statement-breakpoint
CREATE TABLE `directories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT NOW(),
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `directories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`directoryId` int,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`alt` text NOT NULL,
	`mimetype` text NOT NULL,
	`width` int,
	`height` int,
	`createdAt` datetime NOT NULL DEFAULT NOW(),
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `filesToPages` (
	`pageId` int NOT NULL,
	`fileId` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `filesToSlides` (
	`slideId` int NOT NULL,
	`fileId` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `footerContents` (
	`language` varchar(32) NOT NULL,
	`emails` json NOT NULL DEFAULT ('[]'),
	`phoneNumbers` json NOT NULL DEFAULT ('[]'),
	`location` json NOT NULL DEFAULT ('{"text":"Gdzie nas znaleźć","value":""}'),
	`socials` json NOT NULL DEFAULT ('[]'),
	`createdAt` datetime NOT NULL DEFAULT NOW(),
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `footerContents_language` PRIMARY KEY(`language`)
);
--> statement-breakpoint
CREATE TABLE `menuLinks` (
	`pageId` int NOT NULL,
	`text` varchar(256) NOT NULL,
	`position` int NOT NULL,
	`parentId` int DEFAULT -1,
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `menuLinks_pageId` PRIMARY KEY(`pageId`)
);
--> statement-breakpoint
CREATE TABLE `meta` (
	`language` varchar(32) NOT NULL,
	`meta` json NOT NULL DEFAULT ('[{"name":"robots","content":"index, follow"}]'),
	`createdAt` datetime NOT NULL DEFAULT NOW(),
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `meta_language` PRIMARY KEY(`language`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` varchar(32) NOT NULL,
	`title` varchar(256) NOT NULL,
	`slug` varchar(256) NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT NOW(),
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slideAspectRatio` (
	`value` varchar(256) NOT NULL,
	`updatedAt` datetime NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
INSERT INTO slideAspectRatio (value) VALUES ('1 / 3');
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`rawContent` text NOT NULL DEFAULT ('<div>
	<h3>Slide</h3>
</div>'),
	`parsedContent` text NOT NULL DEFAULT ('<div>
	<h3>Slide</h3>
</div>'),
	`isHidden` boolean NOT NULL DEFAULT false,
	`language` varchar(32) NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT NOW(),
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `slides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(256) NOT NULL,
	`username` varchar(256) NOT NULL,
	`password` text NOT NULL,
	`createdAt` datetime NOT NULL DEFAULT NOW(),
	`updatedAt` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `contents` ADD CONSTRAINT `contents_pageId_pages_id_fk` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `directories` ADD CONSTRAINT `directories_parentId_directories_id_fk` FOREIGN KEY (`parentId`) REFERENCES `directories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_directoryId_directories_id_fk` FOREIGN KEY (`directoryId`) REFERENCES `directories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `filesToPages` ADD CONSTRAINT `filesToPages_pageId_pages_id_fk` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `filesToPages` ADD CONSTRAINT `filesToPages_fileId_files_id_fk` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `filesToSlides` ADD CONSTRAINT `filesToSlides_slideId_slides_id_fk` FOREIGN KEY (`slideId`) REFERENCES `slides`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `filesToSlides` ADD CONSTRAINT `filesToSlides_fileId_files_id_fk` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menuLinks` ADD CONSTRAINT `menuLinks_pageId_pages_id_fk` FOREIGN KEY (`pageId`) REFERENCES `pages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `languageIndex` ON `pages` (`language`);
