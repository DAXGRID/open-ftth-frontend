import { useCallback } from "react";
import { send } from "./BridgeConnector";
import { useAuth } from "react-oidc-context";

export interface RetrieveSelectedSpanEquipmentsResponse {
  selectedFeaturesMrid: string[];
  username: string;
  eventType: string;
}

function useBridgeConnector() {
  const auth = useAuth();

  const retrieveSelectedEquipments = useCallback(() => {
    if (!auth.user?.profile.preferred_username) return;

    const message = {
      eventType: "RetrieveSelected",
      username: auth.user?.profile.preferred_username,
    };

    send(message);
  }, [auth.user?.profile.preferred_username]);

  const retrieveIdentifiedNetworkElement = useCallback(() => {
    if (!auth.user?.profile.preferred_username) return;

    const message = {
      eventType: "RetrieveIdentifiedNetworkElement",
      username: auth.user?.profile.preferred_username,
    };

    send(message);
  }, [auth.user?.profile.preferred_username]);

  const panToCoordinate = useCallback(
    (coordinate: string) => {
      if (!auth.user?.profile.preferred_username) return;

      const message = {
        eventType: "PanToCoordinate",
        username: auth.user?.profile.preferred_username,
        coordinate: JSON.parse(coordinate),
      };

      send(message);
    },
    [auth.user?.profile.preferred_username]
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
        username: auth.user?.profile.preferred_username,
      };

      send(message);
    },
    [auth.user?.profile.preferred_username]
  );

  const selectRouteSegments = useCallback(
    (segmentIds: string[]) => {
      const message = {
        eventType: "SelectRouteSegments",
        Mrids: segmentIds,
        username: auth.user?.profile.preferred_username,
      };

      send(message);
    },
    [auth.user?.profile.preferred_username]
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
