import { send } from "./BridgeConnector";

function useBridgeConnector() {
  function retrieveSelected() {
    const message = { eventType: "RetrieveSelected", username: "user" };
    send(message);
  }

  function panToCoordinate(coordinate) {
    const message = {
      eventType: "PanToCoordinate",
      username: "user",
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
      username: "user",
    };

    send(message);
  }

  return { retrieveSelected, panToCoordinate, highlightFeatures };
}

export default useBridgeConnector;
