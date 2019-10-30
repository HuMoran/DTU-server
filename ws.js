const WebSocket = require('ws');

let wss;

function initWs(httpServer) {
  wss = new WebSocket.Server({ server: httpServer });
  wss.on('connection', () => {
    console.log('new client');
  });
}

function sendBroadcastMsg(msg) {
  try {
    const data = JSON.stringify(msg);
    if (!wss) {
      console.error('no websocket server');
      return;
    }
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  } catch (error) {
    console.error('sendMsg error:', error);
  }
}

module.exports = {
  initWs,
  sendBroadcastMsg,
};
