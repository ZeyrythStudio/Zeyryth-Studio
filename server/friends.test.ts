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

describe("friends", () => {
  it("should send a friend request", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.friends.send({ friendId: 2 });
    expect(result.success).toBe(true);
  });

  it("should not allow adding yourself as friend", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.friends.send({ friendId: 1 })).rejects.toThrow();
  });

  it("should list friends", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const friends = await caller.friends.list();
    expect(Array.isArray(friends)).toBe(true);
  });

  it("should list friend requests", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const requests = await caller.friends.requests();
    expect(Array.isArray(requests)).toBe(true);
  });
});
