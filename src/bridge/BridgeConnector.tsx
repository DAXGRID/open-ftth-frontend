import { useEffect, useContext, useState } from "react";
import { w3cwebsocket } from "websocket";
import PubSub from "pubsub-js";
import Config from "../config";
import useBridgeConnector, {
  RetrieveSelectedSpanEquipmentsResponse,
} from "../bridge/useBridgeConnector";
import { MapContext } from "../contexts/MapContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuth } from "react-oidc-context";

type IdentifyNetworkEvent = {
  eventType: string;
  identifiedFeatureId: string;
  selectedType: string;
  username: string;
};

interface TilesetUpdatedEvent {
  tilesetName: string;
}

let websocketClient: w3cwebsocket | null;

function send(eventMsg: any) {
  websocketClient?.send(JSON.stringify(eventMsg));
}

function BridgeConnector() {
  const { t } = useTranslation();
  const {
    setSelectedSegmentIds,
    setIdentifiedFeature,
    trace,
    searchResult,
    identifiedFeature,
    tilesetUpdated,
  } = useContext(MapContext);
  const [connected, setConnected] = useState(false);
  const {
    retrieveSelectedEquipments,
    retrieveIdentifiedNetworkElement,
    highlightFeatures,
    panToCoordinate,
  } = useBridgeConnector();
  const auth = useAuth();

  useEffect(() => {
    function setup() {
      websocketClient = new w3cwebsocket(Config.DESKTOP_BRIDGE_URI);

      websocketClient.onmessage = (message: any) => {
        const event = JSON.parse(message.data);
        PubSub.publish(event.eventType, event);
      };

      websocketClient.onopen = () => {
        setConnected(true);
        console.log("Connected to BridgeConnector");
      };

      websocketClient.onclose = () => {
        console.log("Disconnected from BridgeConnector");
        setConnected(false);
        reconnect();
      };

      websocketClient.onerror = () => {
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
      websocketClient = null;
    };
  }, []);

  useEffect(() => {
    if (!connected || !websocketClient || websocketClient.readyState !== 1)
      return;

    const token = PubSub.subscribe(
      "RetrieveSelectedResponse",
      async (_msg: string, data: RetrieveSelectedSpanEquipmentsResponse) => {
        if (data.username === auth.user?.profile.preferred_username) {
          // If the user has not saved inside of the map
          if (data.selectedFeaturesMrid.includes("uuid_generate_v4()")) {
            toast.error(t("NOT_VALID_SELECTION"));
            setSelectedSegmentIds([]);
          } else {
            setSelectedSegmentIds(data.selectedFeaturesMrid);
          }
        }
      },
    );

    retrieveSelectedEquipments();

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [
    connected,
    setSelectedSegmentIds,
    retrieveSelectedEquipments,
    auth.user?.profile.preferred_username,
    t,
  ]);

  useEffect(() => {
    if (!connected || !websocketClient || websocketClient.readyState !== 1)
      return;

    const token = PubSub.subscribe(
      "TilesetUpdated",
      async (_msg: string, data: TilesetUpdatedEvent) => {
        tilesetUpdated(data.tilesetName);
      },
    );

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [connected, tilesetUpdated]);

  useEffect(() => {
    if (!connected || !websocketClient || websocketClient.readyState !== 1)
      return;

    const token = PubSub.subscribe(
      "IdentifyNetworkElement",
      (_msg: string, data: IdentifyNetworkEvent) => {
        if (
          data.selectedType !== "RouteNode" &&
          data.selectedType !== "RouteSegment" &&
          data.selectedType !== null
        ) {
          // Do nothing
          return;
        }

        if (!data.identifiedFeatureId) {
          return;
        }

        if (data.username === auth.user?.profile.preferred_username) {
          if (data.identifiedFeatureId === "uuid_generate_v4()") {
            toast.error(t("NOT_VALID_SELECTION"));
          } else {
            setIdentifiedFeature({
              id: data.identifiedFeatureId,
              type: data.selectedType as "RouteSegment" | "RouteNode" | null,
              extraMapInformation: null,
            });
          }
        }
      },
    );

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [
    connected,
    setIdentifiedFeature,
    auth.user?.profile.preferred_username,
    t,
  ]);

  useEffect(() => {
    // We only want to retrieve the identified feature once after the connection
    // has been made. The reason for this is that in case the socket is disconnected
    // on the client, we don't want to disturb their workflow by getting the selected
    // feature from the external source, in case they're doing something else.
    if (
      identifiedFeature ||
      !connected ||
      !websocketClient ||
      websocketClient.readyState !== 1
    ) {
      return;
    }

    retrieveIdentifiedNetworkElement();
  }, [identifiedFeature, connected, retrieveIdentifiedNetworkElement]);

  useEffect(() => {
    if (!connected || !websocketClient || websocketClient.readyState !== 1)
      return;

    const etrs89 = trace.etrs89
      ? {
          maxX: trace.etrs89.maxX,
          maxY: trace.etrs89.maxY,
          minX: trace.etrs89.minX,
          minY: trace.etrs89.minY,
        }
      : null;

    highlightFeatures(trace.ids, etrs89);
  }, [trace, highlightFeatures, connected]);

  useEffect(() => {
    if (!searchResult) return;
    panToCoordinate(`[${searchResult.xetrs},${searchResult.yetrs}]`);
  }, [searchResult, panToCoordinate]);

  return <></>;
}

export default BridgeConnector;
export { send };
