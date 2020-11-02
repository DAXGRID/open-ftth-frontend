import { send } from "./BridgeConnector";

function useBridgeConnector() {
  function retrieveSelected() {
    const message = { eventType: "retrieveSelected" };
    return send(message);
  }

  return [retrieveSelected];
}

export default useBridgeConnector;
