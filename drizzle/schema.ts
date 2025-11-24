import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Profile customization
  avatar: text("avatar"), // URL to avatar image
  bio: text("bio"),
  
  // Gamification
  activityPoints: int("activityPoints").default(0).notNull(),
  currentTitle: varchar("currentTitle", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  activityIdx: index("activity_idx").on(table.activityPoints),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Color palettes created by users
 */
export const palettes = mysqlTable("palettes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  colors: text("colors").notNull(), // JSON array of hex colors
  isPublic: boolean("isPublic").default(false).notNull(),
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  publicIdx: index("public_idx").on(table.isPublic),
}));

export type Palette = typeof palettes.$inferSelect;
export type InsertPalette = typeof palettes.$inferInsert;

/**
 * Friendships between users
 */
export const friendships = mysqlTable("friendships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  friendId: int("friendId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  friendIdx: index("friend_idx").on(table.friendId),
}));

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

/**
 * Private messages between friends
 */
export const privateMessages = mysqlTable("privateMessages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  senderIdx: index("sender_idx").on(table.senderId),
  receiverIdx: index("receiver_idx").on(table.receiverId),
}));

export type PrivateMessage = typeof privateMessages.$inferSelect;
export type InsertPrivateMessage = typeof privateMessages.$inferInsert;

/**
 * Global chat messages
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  createdIdx: index("created_idx").on(table.createdAt),
}));

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * User trophies/achievements
 */
export const trophies = mysqlTable("trophies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trophyType: varchar("trophyType", { length: 100 }).notNull(),
  trophyName: varchar("trophyName", { length: 255 }).notNull(),
  description: text("description"),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type Trophy = typeof trophies.$inferSelect;
export type InsertTrophy = typeof trophies.$inferInsert;

/**
 * User activity log for gamification
 */
export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityType: varchar("activityType", { length: 100 }).notNull(),
  points: int("points").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  createdIdx: index("created_idx").on(table.createdAt),
}));

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

/**
 * Shared palettes between users
 */
export const sharedPalettes = mysqlTable("sharedPalettes", {
  id: int("id").autoincrement().primaryKey(),
  paletteId: int("paletteId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  paletteIdx: index("palette_idx").on(table.paletteId),
  receiverIdx: index("receiver_idx").on(table.receiverId),
}));

export type SharedPalette = typeof sharedPalettes.$inferSelect;
export type InsertSharedPalette = typeof sharedPalettes.$inferInsert;
