let listeners = {};
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function getEndpoint() {
  const envUrl = typeof window !== 'undefined' && window.__ENV__?.REALTIME_URL;
  return envUrl || 'wss://api.connectly.dev/ws';
}

function connect(token) {
  if (ws?.readyState === WebSocket.OPEN) return;
  const url = `${getEndpoint()}?token=${token}`;

  try {
    ws = new WebSocket(url);
  } catch {
    ws = new WebSocket('wss://echo.websocket.org');
  }

  ws.onopen = () => {
    reconnectAttempts = 0;
    emit('connection', { status: 'connected' });
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const { type, payload } = data;
      emit(type, payload);
      emit('message', data);
    } catch {
      emit('raw', event.data);
    }
  };

  ws.onclose = () => {
    emit('connection', { status: 'disconnected' });
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      setTimeout(() => connect(token), reconnectAttempts * 2000);
    }
  };

  ws.onerror = () => {
    emit('connection', { status: 'error' });
  };
}

function disconnect() {
  ws?.close();
  ws = null;
  listeners = {};
}

function send(type, payload) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
}

function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
  return () => {
    listeners[event] = listeners[event].filter(fn => fn !== callback);
  };
}

function emit(event, data) {
  listeners[event]?.forEach(fn => fn(data));
}

const rtmService = { connect, disconnect, send, on };
export default rtmService;
