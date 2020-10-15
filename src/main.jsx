import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Client, defaultExchanges, subscriptionExchange, Provider } from "urql";
import Transport from "subscriptions-transport-ws";

import "./global-styles/reset.css";
import "./global-styles/index.css";

const subscriptionClient = new Transport.SubscriptionClient(
  "ws://10.101.247.65/graphql",
  { reconnect: true }
);

const client = new Client({
  url: "http://10.101.247.65/graphql",
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription(operation) {
        return subscriptionClient.request(operation);
      },
    }),
  ],
});

ReactDOM.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
