const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || null;

async function createRedisAdapter() {
  const pubClient = createClient({ url: `redis://redis:6379` });
  const subClient = pubClient.duplicate();
  await pubClient.connect();
  await subClient.connect();
  return createAdapter(pubClient, subClient);
}

async function main() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  try {
    const adapter = await createRedisAdapter();
    io.adapter(adapter);
    console.log('Redis adapter attached');
  } catch (err) {
    console.warn('Could not attach redis adapter, continuing without it', err.message);
  }

  // JWT auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: token required'));
      }

      socket.authToken = token;

      if (!JWT_SECRET) {
        console.warn('JWT secret not configured in websocket service; skipping verification');
        return next();
      }

      try {
        const payload = jwt.verify(token, JWT_SECRET);
        socket.user = payload;
        return next();
      } catch (verifyErr) {
        return next(new Error('Authentication error: invalid token'));
      }
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  async function verifyPagePermission(pageId, permission = 'view', token) {
    if (!pageId) return false;
    const authToken = token || null;
    if (!authToken) return false;

    const backendUrl = process.env.BACKEND_URL || 'http://backend:3000';
    const url = `${backendUrl}/api/pages/${encodeURIComponent(pageId)}/authorize?permission=${encodeURIComponent(permission)}`;

    if (typeof fetch !== 'function') {
      console.error('Fetch API is not available in this runtime');
      return false;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return response.ok;
    } catch (err) {
      console.error('Failed to verify page permission', err.message || err);
      return false;
    }
  }

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinPage', async ({ pageId }) => {
      if (!pageId) {
        socket.emit('page:error', { message: 'pageId is required to join a page' });
        return;
      }

      const allowed = await verifyPagePermission(pageId, 'view', socket.authToken);
      if (!allowed) {
        socket.emit('page:error', { message: 'Unauthorized to join this page' });
        return;
      }

      const room = `page:${pageId}`;
      socket.join(room);
      console.log(`${socket.id} joined ${room}`);
    });

    socket.on('leavePage', ({ pageId }) => {
      const room = `page:${pageId}`;
      socket.leave(room);
      console.log(`${socket.id} left ${room}`);
    });

    socket.on('page:content:update', async (payload) => {
      const { pageId, ...rest } = payload || {};
      if (!pageId) {
        socket.emit('page:error', { message: 'pageId is required for content update' });
        return;
      }

      const allowed = await verifyPagePermission(pageId, 'edit', socket.authToken);
      if (!allowed) {
        socket.emit('page:error', { message: 'Unauthorized to update page content' });
        return;
      }

      const room = `page:${pageId}`;
      socket.to(room).emit('page:content:update', { ...rest, from: socket.id });
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
    });
  });

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`WebSocket server listening on port ${PORT}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
