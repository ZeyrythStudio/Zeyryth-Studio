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

describe("palettes", () => {
  it("should create a new palette", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.palettes.create({
      name: "Test Palette",
      description: "A test color palette",
      colors: ["#FF0000", "#00FF00", "#0000FF"],
      isPublic: true,
    });

    expect(result).toBeDefined();
  });

  it("should list user palettes", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a palette first
    await caller.palettes.create({
      name: "My Palette",
      colors: ["#FFFFFF", "#000000"],
      isPublic: false,
    });

    const palettes = await caller.palettes.list();
    expect(Array.isArray(palettes)).toBe(true);
  });

  it("should list public palettes", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const publicPalettes = await caller.palettes.public({ limit: 50 });
    expect(Array.isArray(publicPalettes)).toBe(true);
  });
});
