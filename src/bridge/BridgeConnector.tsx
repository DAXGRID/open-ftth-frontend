import { useEffect } from "react";
import { w3cwebsocket } from "websocket";
import PubSub from "pubsub-js";
import Config from "../config";

let client: w3cwebsocket | null;

function send(eventMsg: any) {
  client?.send(JSON.stringify(eventMsg));
}

function BridgeConnector() {
  useEffect(() => {
    client = new w3cwebsocket(`ws://${Config.DESKTOP_BRIDGE_URI}`);

    client.onmessage = (message: any) => {
      const event = JSON.parse(message.data);
      PubSub.publish(event.eventType, event);
    };

    client.onopen = () => {
      console.log("Connected");
    };

    client.onclose = () => {
      console.log("Disconnected");
    };

    return () => {
      client = null;
    };
  }, []);

  return <></>;
}

export default BridgeConnector;
export { send };
