const WebSocket = require('ws');

class WebSocketEventWrapper {
    constructor({ port, server, onConnect = () => {} }) {
        this.listeners = [];

        this.wss = new WebSocket.Server({ port, server });

        this.wss.on('connection', (client, request) => {
            client.on('message', data => this.handleMessage(data, client));
            onConnect(client, request);
        });
    }

    addEventListener(method) {
        this.listeners.push(method);
    }

    removeEventListener(method) {
        this.listeners.splice(this.listeners.findIndex(method), 1);
    }

    handleMessage(data, client) {
        try {
            const json = JSON.parse(data);

            data = json;
        } catch (_) {}
        this.listeners.map(method => method(data, client));
    }

    broadcast(data, customFilter = () => true) {
        [...this.wss.clients]
            .filter(client => client.readyState === WebSocket.OPEN)
            .filter(customFilter)
            .map(client => this.send(data, client));
    }

    send(data, client) {
        if (typeof data === 'function') {
            this.send(data(client), client);
        } else if (typeof data === 'object') {
            this.send(JSON.stringify(data), client);
        } else if (typeof data === 'string') {
            client.send(data);
        }
    }
}

module.exports = WebSocketEventWrapper;
