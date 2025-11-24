import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import * as db from './db';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/api/socket.io',
  });

  io.on('connection', (socket) => {
    console.log('[Socket.IO] User connected:', socket.id);

    socket.on('join-chat', (userId: number) => {
      socket.join('global-chat');
      console.log(`[Socket.IO] User ${userId} joined global chat`);
    });

    socket.on('send-message', async (data: { userId: number; message: string; userName: string; userAvatar?: string }) => {
      try {
        await db.createChatMessage({
          userId: data.userId,
          message: data.message,
        });

        await db.logActivity({
          userId: data.userId,
          activityType: 'chat_message',
          points: 1,
        });

        await db.updateUserActivity(data.userId, 1);

        io.to('global-chat').emit('new-message', {
          id: Date.now(),
          userId: data.userId,
          message: data.message,
          createdAt: new Date(),
          user: {
            id: data.userId,
            name: data.userName,
            avatar: data.userAvatar,
          },
        });
      } catch (error) {
        console.error('[Socket.IO] Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] User disconnected:', socket.id);
    });
  });

  return io;
}
