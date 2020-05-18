# websocket-event-wrapper

> Simple to setup event-based event wrapper for server-side WebSockets.

## Install

```bash
$ npm install websocket-event-wrapper
```

## Usage

### server.js

<https://github.com/websockets/ws>

```javascript
const WebSocketEventWrapper = require('websocket-event-wrapper');

const server = new WebSocketEventWrapper({
    port: 8080,
    onConnect: () => console.log('connected')
});

server.addEventListener((message, client) => {
    // Broadcast a string to all connections
    server.broadcast('string');
    // Broadcast the result of a function call to all connections
    server.broadcast(client => 'function');
    // Broadcast the result of an asynchronous function call to all connections
    server.broadcast(async client => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        return 'async function';
    });
});

server.addEventListener((message, client) => {
    // Send message to a specific group of connections
    server.broadcast('string', client => client.roomId === 1);
});
```

### client.js

<https://developer.mozilla.org/en-US/docs/Web/API/WebSocket>

```javascript
const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', () => {
    // Send a message to the server
    socket.send('Hello Server!');
});

socket.addEventListener('message', {data} => {
    // Output all messages from server
    console.log('Message from server ', data);
});
```
