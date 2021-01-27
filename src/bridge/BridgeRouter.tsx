import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import PubSub from "pubsub-js";

type IdentifyNetworkEvent = {
  eventType: string;
  identifiedFeatureId: string;
  selectedType: string;
  username: string;
};

function BridgeRouter() {
  const history = useHistory();

  useEffect(() => {
    const token = PubSub.subscribe(
      "IdentifyNetworkElement",
      (_msg: string, data: IdentifyNetworkEvent) => {
        history.push(`/identify-feature/${data.identifiedFeatureId}`);
      }
    );

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [history]);

  return <></>;
}

export default BridgeRouter;
