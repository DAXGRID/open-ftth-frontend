import { useEffect, useContext, useState } from "react";
import { w3cwebsocket } from "websocket";
import PubSub from "pubsub-js";
import Config from "../config";
import useBridgeConnector, {
  RetrieveSelectedSpanEquipmentsResponse,
} from "../bridge/useBridgeConnector";
import { MapContext } from "../contexts/MapContext";

let client: w3cwebsocket | null;

function send(eventMsg: any) {
  client?.send(JSON.stringify(eventMsg));
}

function BridgeConnector() {
  const { setSelectedSegments } = useContext(MapContext);
  const [connected, setConnected] = useState(false);
  const { retrieveSelectedEquipments } = useBridgeConnector();

  useEffect(() => {
    function setup() {
      client = new w3cwebsocket(Config.DESKTOP_BRIDGE_URI);

      client.onmessage = (message: any) => {
        const event = JSON.parse(message.data);
        PubSub.publish(event.eventType, event);
      };

      client.onopen = () => {
        setConnected(true);
        console.log("Connected to BridgeConnector");
      };

      client.onclose = () => {
        console.log("Disconnected from BridgeConnector");
        setConnected(false);
        reconnect();
      };

      client.onerror = () => {
        console.log("Error happend in BridgeConnector");
        setConnected(false);
        reconnect();
      };

      function reconnect() {
        setTimeout(() => {
          console.log("Reconnecting to BridgeConnector");
          setup();
        }, 5000);
      }
    }

    setup();

    return () => {
      setConnected(false);
      client = null;
    };
  }, []);

  useEffect(() => {
    if (!connected || !client || client.readyState !== 1) return;

    const token = PubSub.subscribe(
      "RetrieveSelectedResponse",
      async (_msg: string, data: RetrieveSelectedSpanEquipmentsResponse) => {
        setSelectedSegments(data.selectedFeaturesMrid);
      }
    );

    retrieveSelectedEquipments();

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [connected, setSelectedSegments, retrieveSelectedEquipments]);

  return <></>;
}

export default BridgeConnector;
export { send };
