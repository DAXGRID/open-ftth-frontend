import { send } from "./BridgeConnector";

function useBridgeConnector() {
  function retrieveSelected() {
    const message = { eventType: "RetrieveSelected", username: "notation" };
    return send(message);
  }

  return [retrieveSelected];
}

export default useBridgeConnector;
