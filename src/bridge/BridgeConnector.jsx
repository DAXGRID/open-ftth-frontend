import React, { useEffect } from 'react';
import WebSocket from 'websocket';
import PubSub from 'pubsub-js';
import Config from '../config';

let client;

function send(eventMsg) {
  client.send(JSON.stringify(eventMsg));
}

function BridgeConnector() {
  useEffect(() => {
    client = new WebSocket.w3cwebsocket(`ws://${Config.DESKTOP_BRIDGE_URI}`);

    client.onmessage = (message) => {
      const event = JSON.parse(message.data);
      PubSub.publish(event.eventType, event);
    };

    return () => {
      client = null;
    };
  }, []);

  return <></>;
}

export default BridgeConnector;
export { send };
