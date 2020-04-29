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
    server.broadcast(message);
});
```

### client.js

<https://developer.mozilla.org/en-US/docs/Web/API/WebSocket>

```javascript
const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', event => {
    socket.send('Hello Server!');
});

socket.addEventListener('message', event => {
    console.log('Message from server ', event.data);
});
```
