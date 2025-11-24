CREATE TABLE `activityLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(100) NOT NULL,
	`points` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `friendships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`friendId` int NOT NULL,
	`status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `friendships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `palettes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`colors` text NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT false,
	`likes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `palettes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `privateMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`message` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `privateMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sharedPalettes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paletteId` int NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sharedPalettes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trophies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trophyType` varchar(100) NOT NULL,
	`trophyName` varchar(255) NOT NULL,
	`description` text,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trophies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `activityPoints` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `currentTitle` varchar(100);--> statement-breakpoint
CREATE INDEX `user_idx` ON `activityLog` (`userId`);--> statement-breakpoint
CREATE INDEX `created_idx` ON `activityLog` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `chatMessages` (`userId`);--> statement-breakpoint
CREATE INDEX `created_idx` ON `chatMessages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `friendships` (`userId`);--> statement-breakpoint
CREATE INDEX `friend_idx` ON `friendships` (`friendId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `palettes` (`userId`);--> statement-breakpoint
CREATE INDEX `public_idx` ON `palettes` (`isPublic`);--> statement-breakpoint
CREATE INDEX `sender_idx` ON `privateMessages` (`senderId`);--> statement-breakpoint
CREATE INDEX `receiver_idx` ON `privateMessages` (`receiverId`);--> statement-breakpoint
CREATE INDEX `palette_idx` ON `sharedPalettes` (`paletteId`);--> statement-breakpoint
CREATE INDEX `receiver_idx` ON `sharedPalettes` (`receiverId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `trophies` (`userId`);--> statement-breakpoint
CREATE INDEX `activity_idx` ON `users` (`activityPoints`);