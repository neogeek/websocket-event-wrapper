import { Server as HTTPServer, IncomingMessage } from 'http';
import { Server as HTTPSServer } from 'https';

import WebSocket, { WebSocketServer } from 'ws';

class WebSocketEventWrapper {
  wss;

  listeners: ((
    data: WebSocket.RawData | JSON | string,
    client: WebSocket
  ) => void)[];

  constructor({
    port,
    server,
    onConnect,
  }: {
    port?: number;
    server?:
      | HTTPServer<typeof IncomingMessage>
      | HTTPSServer<typeof IncomingMessage>;
    onConnect?: (client: WebSocket, request: IncomingMessage) => void;
  }) {
    this.listeners = [];

    this.wss = new WebSocketServer({ port, server });

    this.wss.on('connection', (client, request) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(Date.now(), 'Client connected!');
      }

      client.on('message', (data, isBinary) => {
        if (!isBinary) {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          this.handleMessage(data.toString(), client);
        } else {
          this.handleMessage(data, client);
        }
      });

      if (onConnect) {
        onConnect(client, request);
      }
    });

    this.wss.on('error', error => {
      if (process.env.NODE_ENV === 'development') {
        console.log(Date.now(), 'Client threw an error!', error);
      }
    });

    this.wss.on('close', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(Date.now(), 'Client closed :(');
      }
    });
  }

  addEventListener(
    method: (data: WebSocket.RawData | JSON | string, client: WebSocket) => void
  ) {
    this.listeners.push(method);
  }
  removeEventListener(
    method: (data: WebSocket.RawData | JSON | string, client: WebSocket) => void
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.listeners.splice(this.listeners.findIndex(method), 1);
  }

  handleMessage(data: WebSocket.RawData | JSON | string, client: WebSocket) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      console.log(Date.now(), `Message received: ${data.toString()}`);
    }

    try {
      if (typeof data === 'string') {
        const json = JSON.parse(data) as JSON;

        this.listeners.map(method => method(json, client));
      }
    } catch {
      this.listeners.map(method => method(data, client));
    }
  }

  async broadcast(
    data:
      | WebSocket.RawData
      | JSON
      | string
      | ((client: WebSocket) => Promise<WebSocket.RawData | string>),
    customFilter?: (client: WebSocket) => boolean
  ) {
    const clients = Array.from(this.wss.clients);

    for (let i = 0; i < clients.length; i += 1) {
      if (
        clients[i].readyState === WebSocket.OPEN &&
        (!customFilter || customFilter(clients[i]))
      ) {
        await this.send(data, clients[i]);
      }
    }
  }

  async send(
    data:
      | WebSocket.RawData
      | JSON
      | string
      | ((client: WebSocket) => Promise<WebSocket.RawData | string>),
    client: WebSocket
  ) {
    const result = typeof data === 'function' ? await data(client) : data;

    if (typeof result === 'object') {
      client.send(JSON.stringify(result));
    } else if (typeof result === 'string') {
      client.send(result);
    }
  }
}

export default WebSocketEventWrapper;
