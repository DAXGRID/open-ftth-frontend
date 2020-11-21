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

  return { retrieveSelected, panToCoordinate };
}

export default useBridgeConnector;
