import { useEffect, useContext, useState } from "react";
import { w3cwebsocket } from "websocket";
import PubSub from "pubsub-js";
import Config from "../config";
import useBridgeConnector, {
  RetrieveSelectedSpanEquipmentsResponse,
} from "../bridge/useBridgeConnector";
import { MapContext } from "../contexts/MapContext";
import { useKeycloak } from "@react-keycloak/web";

type IdentifyNetworkEvent = {
  eventType: string;
  identifiedFeatureId: string;
  selectedType: string;
  username: string;
};

let client: w3cwebsocket | null;

function send(eventMsg: any) {
  client?.send(JSON.stringify(eventMsg));
}

function BridgeConnector() {
  const { setSelectedSegmentIds, setIdentifiedFeature } = useContext(
    MapContext
  );
  const [connected, setConnected] = useState(false);
  const {
    retrieveSelectedEquipments,
    retrieveIdentifiedNetworkElement,
  } = useBridgeConnector();
  const { keycloak } = useKeycloak();

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
        if (data.username === keycloak.profile?.username) {
          setSelectedSegmentIds(data.selectedFeaturesMrid);
        }
      }
    );

    retrieveSelectedEquipments();

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [
    connected,
    setSelectedSegmentIds,
    retrieveSelectedEquipments,
    keycloak.profile?.username,
  ]);

  useEffect(() => {
    if (!connected || !client || client.readyState !== 1) return;

    const token = PubSub.subscribe(
      "IdentifyNetworkElement",
      (_msg: string, data: IdentifyNetworkEvent) => {
        if (
          data.selectedType !== "RouteNode" &&
          data.selectedType !== "RouteSegment"
        ) {
          // Do nothing
          return;
        }

        if (data.username === keycloak.profile?.username) {
          setIdentifiedFeature({
            id: data.identifiedFeatureId,
            type: data.selectedType as "RouteSegment" | "RouteNode",
          });
        }
      }
    );

    retrieveIdentifiedNetworkElement();

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [
    connected,
    retrieveIdentifiedNetworkElement,
    setIdentifiedFeature,
    keycloak.profile?.username,
  ]);

  return <></>;
}

export default BridgeConnector;
export { send };
