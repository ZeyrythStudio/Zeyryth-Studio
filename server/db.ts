import { eq, desc, and, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  palettes, 
  InsertPalette,
  friendships,
  InsertFriendship,
  privateMessages,
  InsertPrivateMessage,
  chatMessages,
  InsertChatMessage,
  trophies,
  InsertTrophy,
  activityLog,
  InsertActivityLog,
  sharedPalettes,
  InsertSharedPalette
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER FUNCTIONS =====
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatar", "bio", "currentTitle"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { avatar?: string; bio?: string; name?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function updateUserActivity(userId: number, points: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ 
    activityPoints: sql`${users.activityPoints} + ${points}` 
  }).where(eq(users.id, userId));
}

export async function getTopUsers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.activityPoints)).limit(limit);
}

// ===== PALETTE FUNCTIONS =====
export async function createPalette(palette: InsertPalette) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(palettes).values(palette);
  return result;
}

export async function getUserPalettes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(palettes).where(eq(palettes.userId, userId)).orderBy(desc(palettes.createdAt));
}

export async function getPublicPalettes(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(palettes).where(eq(palettes.isPublic, true)).orderBy(desc(palettes.createdAt)).limit(limit);
}

export async function getPaletteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(palettes).where(eq(palettes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePalette(id: number, data: Partial<InsertPalette>) {
  const db = await getDb();
  if (!db) return;
  await db.update(palettes).set(data).where(eq(palettes.id, id));
}

export async function deletePalette(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(palettes).where(eq(palettes.id, id));
}

// ===== FRIENDSHIP FUNCTIONS =====
export async function createFriendship(friendship: InsertFriendship) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(friendships).values(friendship);
}

export async function getFriendships(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(friendships).where(
    and(
      or(eq(friendships.userId, userId), eq(friendships.friendId, userId)),
      eq(friendships.status, 'accepted')
    )
  );
}

export async function getPendingFriendRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(friendships).where(
    and(
      eq(friendships.friendId, userId),
      eq(friendships.status, 'pending')
    )
  );
}

export async function updateFriendshipStatus(id: number, status: 'accepted' | 'rejected') {
  const db = await getDb();
  if (!db) return;
  await db.update(friendships).set({ status }).where(eq(friendships.id, id));
}

// ===== MESSAGE FUNCTIONS =====
export async function createPrivateMessage(message: InsertPrivateMessage) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(privateMessages).values(message);
}

export async function getPrivateMessages(userId1: number, userId2: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(privateMessages).where(
    or(
      and(eq(privateMessages.senderId, userId1), eq(privateMessages.receiverId, userId2)),
      and(eq(privateMessages.senderId, userId2), eq(privateMessages.receiverId, userId1))
    )
  ).orderBy(desc(privateMessages.createdAt)).limit(limit);
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(privateMessages).set({ read: true }).where(eq(privateMessages.id, id));
}

// ===== CHAT FUNCTIONS =====
export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(chatMessages).values(message);
}

export async function getChatMessages(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt)).limit(limit);
}

// ===== TROPHY FUNCTIONS =====
export async function createTrophy(trophy: InsertTrophy) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(trophies).values(trophy);
}

export async function getUserTrophies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trophies).where(eq(trophies.userId, userId)).orderBy(desc(trophies.earnedAt));
}

// ===== ACTIVITY LOG FUNCTIONS =====
export async function logActivity(activity: InsertActivityLog) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(activityLog).values(activity);
}

export async function getUserActivityLog(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog).where(eq(activityLog.userId, userId)).orderBy(desc(activityLog.createdAt)).limit(limit);
}

// ===== SHARED PALETTE FUNCTIONS =====
export async function sharePalette(share: InsertSharedPalette) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(sharedPalettes).values(share);
}

export async function getSharedPalettes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sharedPalettes).where(eq(sharedPalettes.receiverId, userId)).orderBy(desc(sharedPalettes.createdAt));
}
