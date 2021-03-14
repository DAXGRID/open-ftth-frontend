import { useCallback } from "react";
import { send } from "./BridgeConnector";
import { useKeycloak } from "@react-keycloak/web";

export interface RetrieveSelectedSpanEquipmentsResponse {
  selectedFeaturesMrid: string[];
  username: string;
  eventType: string;
}

function useBridgeConnector() {
  const { keycloak } = useKeycloak();

  const retrieveSelectedEquipments = useCallback(() => {
    if (!keycloak.profile?.username) return;

    const message = {
      eventType: "RetrieveSelected",
      username: keycloak.profile?.username,
    };

    send(message);
  }, [keycloak.profile?.username]);

  const retrieveIdentifiedNetworkElement = useCallback(() => {
    if (!keycloak.profile?.username) return;

    const message = {
      eventType: "RetrieveIdentifiedNetworkElement",
      username: keycloak.profile?.username,
    };

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

  const highlightFeatures = useCallback(
    (featureIds: string[]) => {
      if (featureIds.length === 0) return;

      const message = {
        eventType: "HighlightFeatures",
        IdentifiedFeatureMrids: featureIds,
        featureType: "RouteSegment",
        username: keycloak.profile?.username,
      };

      send(message);
    },
    [keycloak.profile?.username]
  );

  return {
    retrieveSelectedEquipments,
    retrieveIdentifiedNetworkElement,
    panToCoordinate,
    highlightFeatures,
  };
}

export default useBridgeConnector;
