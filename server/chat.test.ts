import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    avatar: null,
    bio: null,
    activityPoints: 0,
    currentTitle: null,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("chat", () => {
  it("should send a chat message", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.send({ message: "Hello, world!" });
    expect(result.success).toBe(true);
  });

  it("should list chat messages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const messages = await caller.chat.messages({ limit: 100 });
    expect(Array.isArray(messages)).toBe(true);
  });
});

describe("leaderboard", () => {
  it("should get top users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const topUsers = await caller.leaderboard.top({ limit: 10 });
    expect(Array.isArray(topUsers)).toBe(true);
  });
});

describe("profile", () => {
  it("should get user profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const profile = await caller.profile.get({});
    expect(profile).toBeDefined();
    expect(profile.id).toBe(1);
  });

  it("should update user profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.update({
      name: "Updated Name",
      bio: "Updated bio",
    });
    expect(result.success).toBe(true);
  });

  it("should get user trophies", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const trophies = await caller.profile.getTrophies({});
    expect(Array.isArray(trophies)).toBe(true);
  });
});
