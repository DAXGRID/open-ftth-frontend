import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import PubSub from "pubsub-js";

function BridgeRouter() {
  const history = useHistory();

  useEffect(() => {
    const token = PubSub.subscribe(
      "IdentifyNetworkElement",
      (_msg: string, data: any) => {
        history.push(`/identify-feature/${data.identifiedFeatureId}`);
      }
    );

    return () => {
      PubSub.unsubscribe(token);
    };
  }, []);

  return <></>;
}

export default BridgeRouter;
