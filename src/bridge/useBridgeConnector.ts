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

  const panToCoordinate = useCallback(
    (coordinate: string) => {
      if (!keycloak.profile?.username) return;

      const message = {
        eventType: "PanToCoordinate",
        username: keycloak.profile?.username,
        coordinate: JSON.parse(coordinate),
      };

      send(message);
    },
    [keycloak.profile?.username]
  );

  const highlightFeatures = useCallback(
    (
      featureIds: string[],
      etrs89: {
        maxX: number;
        maxY: number;
        minX: number;
        minY: number;
      } | null
    ) => {
      const message = {
        eventType: "HighlightFeatures",
        identifiedFeatureMrids: featureIds,
        etrs89: etrs89,
        featureType: "RouteSegment",
        username: keycloak.profile?.username,
      };

      send(message);
    },
    [keycloak.profile?.username]
  );

  const selectRouteSegments = useCallback(
    (segmentIds: string[]) => {
      const message = {
        eventType: "SelectRouteSegments",
        Mrids: segmentIds,
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
    selectRouteSegments,
  };
}

export default useBridgeConnector;
