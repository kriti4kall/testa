import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('[WS] Подключен');
});

ws.on('message', (data) => {
  console.log(`[WS] ${data.toString()}`);
});

ws.on('error', (err) => {
  console.error('[WS Error]:', err.message);
});
