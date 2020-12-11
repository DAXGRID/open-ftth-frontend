import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import PubSub from "pubsub-js";

function BridgeRouter() {
  const history = useHistory();

  useEffect(() => {
    const token = PubSub.subscribe("IdentifyNetworkElement", (msg, data) => {
      history.push(`/identify-feature/${data.identifiedFeatureId}`);
    });

    return () => {
      PubSub.unsubscribe(token);
    };
  }, []);

  return <></>;
}

export default BridgeRouter;
