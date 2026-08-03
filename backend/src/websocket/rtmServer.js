// Realtime messaging server matching the shape the frontend's rtmService.js expects:
// messages are JSON { type, payload }. Connect with: wss://<host>/ws?token=<jwt>
const { WebSocketServer } = require('ws');
const { verifyAccessToken } = require('../utils/jwt');

// userId -> Set of live sockets (a user can have multiple tabs/devices open)
const clients = new Map();

function send(ws, type, payload) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
}

function broadcastToUser(userId, type, payload) {
  const sockets = clients.get(userId);
  if (!sockets) return;
  for (const ws of sockets) send(ws, type, payload);
}

function broadcastToMeeting(meetingId, type, payload, exceptWs) {
  for (const sockets of clients.values()) {
    for (const ws of sockets) {
      if (ws !== exceptWs && ws.meetingIds?.has(meetingId)) send(ws, type, payload);
    }
  }
}

function attachRealtimeServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    let userId;
    try {
      const payload = verifyAccessToken(token);
      userId = payload.sub;
    } catch {
      send(ws, 'connection', { status: 'error', message: 'Invalid or missing token' });
      ws.close();
      return;
    }

    ws.userId = userId;
    ws.meetingIds = new Set();
    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId).add(ws);

    send(ws, 'connection', { status: 'connected' });

    ws.on('message', (raw) => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }
      const { type, payload } = data;

      switch (type) {
        case 'join_meeting':
          ws.meetingIds.add(payload.meetingId);
          broadcastToMeeting(payload.meetingId, 'participant_joined', { userId, meetingId: payload.meetingId }, ws);
          break;
        case 'leave_meeting':
          ws.meetingIds.delete(payload.meetingId);
          broadcastToMeeting(payload.meetingId, 'participant_left', { userId, meetingId: payload.meetingId }, ws);
          break;
        case 'chat_message':
          broadcastToMeeting(payload.meetingId, 'chat_message', { ...payload, userId });
          break;
        case 'direct_message':
          broadcastToUser(payload.toUserId, 'direct_message', { ...payload, fromUserId: userId });
          break;
        case 'presence':
          broadcastToUser(payload.toUserId, 'presence', { userId, status: payload.status });
          break;
        case 'webrtc_signal':
          // For a real meeting/video call, forward SDP/ICE signaling to the target peer.
          broadcastToUser(payload.toUserId, 'webrtc_signal', { ...payload, fromUserId: userId });
          break;
        default:
          break;
      }
    });

    ws.on('close', () => {
      clients.get(userId)?.delete(ws);
      if (clients.get(userId)?.size === 0) clients.delete(userId);
      for (const meetingId of ws.meetingIds) {
        broadcastToMeeting(meetingId, 'participant_left', { userId, meetingId }, ws);
      }
    });
  });

  return wss;
}

module.exports = { attachRealtimeServer, broadcastToUser, broadcastToMeeting };
