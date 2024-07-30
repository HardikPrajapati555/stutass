const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create an HTTP server
const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'public', req.url === '/' ? 'status.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'application/javascript';
            break;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Error loading file');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        // Convert buffer to string if needed
        if (Buffer.isBuffer(message)) {
            message = message.toString();
        }

        console.log('Received:', message);

        // Broadcast the message to all clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Notify all clients that a client has disconnected
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('Client disconnected');
            }
        });
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Start the HTTP server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is listening on https://stutass.onrender.com`);
});
