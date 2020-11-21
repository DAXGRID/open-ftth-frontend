import { send } from "./BridgeConnector";

function useBridgeConnector() {
  function retrieveSelected() {
    const message = { eventType: "RetrieveSelected", username: "user" };
    send(message);
  }

  function panToCoordinate() {
    const message = { eventType: "PanToCoordinate", username: "user" };
    send(message);
  }

  return { retrieveSelected, panToCoordinate };
}

export default useBridgeConnector;
