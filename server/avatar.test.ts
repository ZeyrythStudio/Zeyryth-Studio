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

describe("avatar upload", () => {
  it("should reject invalid image formats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.profile.uploadAvatar({
        base64: "invalid",
        mimeType: "application/pdf",
      })
    ).rejects.toThrow("Invalid image format");
  });

  it("should accept valid image formats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const smallBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const result = await caller.profile.uploadAvatar({
      base64: smallBase64,
      mimeType: "image/jpeg",
    });
    
    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
  });
});
