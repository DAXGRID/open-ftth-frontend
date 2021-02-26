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
    function setup() {
      client = new w3cwebsocket(Config.DESKTOP_BRIDGE_URI);

      client.onmessage = (message: any) => {
        const event = JSON.parse(message.data);
        PubSub.publish(event.eventType, event);
      };

      client.onopen = () => {
        console.log("Connected to BridgeConnector");
      };

      client.onclose = () => {
        console.log("Disconnected from BridgeConnector");
        reconnect();
      };

      client.onerror = () => {
        console.log("Error happend in BridgeConnector");
        reconnect();
      };

      function reconnect() {
        setTimeout(() => {
          console.log("Reconnecting to BrideConnector");
          setup();
        }, 5000);
      }
    }

    setup();

    return () => {
      client = null;
    };
  }, []);

  return <></>;
}

export default BridgeConnector;
export { send };
