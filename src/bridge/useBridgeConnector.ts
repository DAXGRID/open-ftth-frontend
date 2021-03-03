import { useCallback } from "react";
import { send } from "./BridgeConnector";
import { useKeycloak } from "@react-keycloak/web";

export interface RetrieveSelectedSpanEquipmentsResponse {
  selectedFeaturesMrid: string[];
}

function useBridgeConnector() {
  const { keycloak } = useKeycloak();

  const retrieveSelectedEquipments = useCallback(() => {
    const message = {
      eventType: "RetrieveSelected",
      username: keycloak.profile?.username,
    };

    console.log(message);
    send(message);
  }, [keycloak.profile?.username]);

  function panToCoordinate(coordinate: string) {
    const message = {
      eventType: "PanToCoordinate",
      username: keycloak.profile?.username,
      coordinate: JSON.parse(coordinate),
    };

    send(message);
  }

  function highlightFeatures() {
    const message = {
      eventType: "HighlightFeatures",
      IdentifiedFeatureMrids: [
        "b92d9f91-1a08-4f49-932a-e64f9cef756b",
        "b92d9f91-1a08-4f49-932a-e64f9cef756b",
      ],
      featureType: "RouteSegment",
      username: keycloak.profile?.username,
    };

    send(message);
  }

  return { retrieveSelectedEquipments, panToCoordinate, highlightFeatures };
}

export default useBridgeConnector;
