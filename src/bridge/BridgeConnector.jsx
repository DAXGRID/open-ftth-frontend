import React, { useEffect } from "react";
import WebSocket from "websocket";

let client;

function send(eventMsg) {
  client.send(JSON.stringify(eventMsg));
}

function BridgeConnector() {
  useEffect(() => {
    client = new WebSocket.w3cwebsocket("ws://127.0.0.1:5000");
    client.onopen = () => {
      console.log("WebSocket client connected");
    };

    client.onmessage = (message) => {
      console.log(message.data);
    };

    client.onclose = () => {
      console.log("WebSocket client disconnected");
    };

    return () => {
      client = null;
    };
  }, []);

  return <React.Fragment></React.Fragment>;
}

export default BridgeConnector;
export { send };
