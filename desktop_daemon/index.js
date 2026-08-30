const WebSocket = require('ws');
const { exec } = require('child_process');
const fs = require('fs').promises;

const wss = new WebSocket.Server({ port: 8080 });

console.log('Z-AI Desktop Sidecar Daemon started on ws://localhost:8080');

wss.on('connection', function connection(ws) {
  console.log('Client connected to Z-AI Daemon.');

  ws.on('message', async function incoming(message) {
    try {
      const data = JSON.parse(message);
      console.log('Received command:', data);

      if (data.action === 'execute') {
        if (!data.command) {
          return ws.send(JSON.stringify({ error: 'Command missing' }));
        }
        console.log(`Executing command: ${data.command}`);
        exec(data.command, (error, stdout, stderr) => {
          ws.send(JSON.stringify({
            action: 'execute_result',
            stdout,
            stderr,
            error: error ? error.message : null
          }));
        });
      } else if (data.action === 'create_file') {
        if (!data.path || !data.content) {
          return ws.send(JSON.stringify({ error: 'Path or content missing' }));
        }
        await fs.writeFile(data.path, data.content, 'utf8');
        ws.send(JSON.stringify({ action: 'create_file_result', success: true }));
      } else if (data.action === 'read_file') {
        if (!data.path) {
          return ws.send(JSON.stringify({ error: 'Path missing' }));
        }
        const content = await fs.readFile(data.path, 'utf8');
        ws.send(JSON.stringify({ action: 'read_file_result', content }));
      } else {
        ws.send(JSON.stringify({ error: 'Unknown action' }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from Z-AI Daemon.');
  });
});
