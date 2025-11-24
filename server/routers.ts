import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        const user = await db.getUserById(userId);
        if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        return user;
      }),
    
    uploadAvatar: protectedProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
          if (!allowedMimes.includes(input.mimeType)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid image format. Supported: JPEG, PNG, WebP, GIF",
            });
          }

          const buffer = Buffer.from(input.base64, "base64");

          if (buffer.length > 5 * 1024 * 1024) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Image size exceeds 5MB limit",
            });
          }

          const ext = input.mimeType.split("/")[1];
          const fileName = `avatars/${ctx.user.id}-${Date.now()}.${ext}`;
          const { url } = await storagePut(fileName, buffer, input.mimeType);

          await db.updateUserProfile(ctx.user.id, { avatar: url });

          return { success: true, url };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload avatar",
          });
        }
      }),
    
    update: protectedProcedure
      .input(z.object({
        avatar: z.string().optional(),
        bio: z.string().optional(),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
    
    getTrophies: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        return db.getUserTrophies(userId);
      }),
  }),

  palettes: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        colors: z.array(z.string()),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createPalette({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          colors: JSON.stringify(input.colors),
          isPublic: input.isPublic,
        });
        
        await db.logActivity({
          userId: ctx.user.id,
          activityType: 'palette_created',
          points: 10,
        });
        await db.updateUserActivity(ctx.user.id, 10);
        
        return result;
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      const palettes = await db.getUserPalettes(ctx.user.id);
      return palettes.map(p => ({
        ...p,
        colors: JSON.parse(p.colors),
      }));
    }),
    
    public: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        const palettes = await db.getPublicPalettes(input.limit);
        return palettes.map(p => ({
          ...p,
          colors: JSON.parse(p.colors),
        }));
      }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const palette = await db.getPaletteById(input.id);
        if (!palette) throw new TRPCError({ code: 'NOT_FOUND' });
        return {
          ...palette,
          colors: JSON.parse(palette.colors),
        };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        colors: z.array(z.string()).optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const palette = await db.getPaletteById(input.id);
        if (!palette) throw new TRPCError({ code: 'NOT_FOUND' });
        if (palette.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.colors) updateData.colors = JSON.stringify(input.colors);
        if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;
        
        await db.updatePalette(input.id, updateData);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const palette = await db.getPaletteById(input.id);
        if (!palette) throw new TRPCError({ code: 'NOT_FOUND' });
        if (palette.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        
        await db.deletePalette(input.id);
        return { success: true };
      }),
    
    share: protectedProcedure
      .input(z.object({
        paletteId: z.number(),
        receiverId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const palette = await db.getPaletteById(input.paletteId);
        if (!palette) throw new TRPCError({ code: 'NOT_FOUND' });
        if (palette.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        
        await db.sharePalette({
          paletteId: input.paletteId,
          senderId: ctx.user.id,
          receiverId: input.receiverId,
        });
        
        return { success: true };
      }),
    
    shared: protectedProcedure.query(async ({ ctx }) => {
      const shared = await db.getSharedPalettes(ctx.user.id);
      const palettes = await Promise.all(
        shared.map(async (s) => {
          const palette = await db.getPaletteById(s.paletteId);
          return palette ? {
            ...palette,
            colors: JSON.parse(palette.colors),
            sharedAt: s.createdAt,
          } : null;
        })
      );
      return palettes.filter(p => p !== null);
    }),
  }),

  friends: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const friendships = await db.getFriendships(ctx.user.id);
      const friends = await Promise.all(
        friendships.map(async (f) => {
          const friendId = f.userId === ctx.user.id ? f.friendId : f.userId;
          return db.getUserById(friendId);
        })
      );
      return friends.filter(f => f !== undefined);
    }),
    
    requests: protectedProcedure.query(async ({ ctx }) => {
      const requests = await db.getPendingFriendRequests(ctx.user.id);
      const users = await Promise.all(
        requests.map(async (r) => {
          const user = await db.getUserById(r.userId);
          return user ? { ...user, requestId: r.id } : null;
        })
      );
      return users.filter(u => u !== null);
    }),
    
    send: protectedProcedure
      .input(z.object({ friendId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.friendId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot add yourself' });
        }
        
        await db.createFriendship({
          userId: ctx.user.id,
          friendId: input.friendId,
          status: 'pending',
        });
        
        return { success: true };
      }),
    
    accept: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateFriendshipStatus(input.requestId, 'accepted');
        
        await db.logActivity({
          userId: ctx.user.id,
          activityType: 'friend_added',
          points: 5,
        });
        await db.updateUserActivity(ctx.user.id, 5);
        
        return { success: true };
      }),
    
    reject: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateFriendshipStatus(input.requestId, 'rejected');
        return { success: true };
      }),
  }),

  messages: router({
    send: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createPrivateMessage({
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          message: input.message,
        });
        
        return { success: true };
      }),
    
    list: protectedProcedure
      .input(z.object({ friendId: z.number(), limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getPrivateMessages(ctx.user.id, input.friendId, input.limit);
      }),
    
    markRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markMessageAsRead(input.messageId);
        return { success: true };
      }),
  }),

  chat: router({
    messages: publicProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        const messages = await db.getChatMessages(input.limit);
        const messagesWithUsers = await Promise.all(
          messages.map(async (m) => {
            const user = await db.getUserById(m.userId);
            return {
              ...m,
              user: user ? { id: user.id, name: user.name, avatar: user.avatar } : null,
            };
          })
        );
        return messagesWithUsers.reverse();
      }),
    
    send: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.createChatMessage({
          userId: ctx.user.id,
          message: input.message,
        });
        
        await db.logActivity({
          userId: ctx.user.id,
          activityType: 'chat_message',
          points: 1,
        });
        await db.updateUserActivity(ctx.user.id, 1);
        
        return { success: true };
      }),
  }),

  leaderboard: router({
    top: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getTopUsers(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
