import React, { useEffect } from "react";
import WebSocket from "websocket";

function BridgeConnector() {
  useEffect(() => {
    let client = new WebSocket.w3cwebsocket("ws://127.0.0.1:5000");
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

  return <div></div>;
}

export default BridgeConnector;
