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

    async broadcast(data, customFilter = () => true) {
        const clients = Array.from(this.wss.clients);

        for (let i = 0; i < clients.length; i += 1) {
            if (
                clients[i].readyState === WebSocket.OPEN &&
                customFilter(clients[i])
            ) {
                await this.send(data, clients[i]);
            }
        }
    }

    async send(data, client) {
        if (typeof data === 'function') {
            this.send(await data(client), client);
        } else if (typeof data === 'object') {
            this.send(JSON.stringify(data), client);
        } else if (typeof data === 'string') {
            client.send(data);
        }
    }
}

module.exports = WebSocketEventWrapper;
