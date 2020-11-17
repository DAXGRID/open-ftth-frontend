import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Client, defaultExchanges, subscriptionExchange, Provider } from "urql";
import Transport from "subscriptions-transport-ws";
import "./translation/i18n";

import "./global-styles/reset.scss";
import "./global-styles/index.scss";

const subscriptionClient = new Transport.SubscriptionClient(
  `ws://${import.meta.env.VITE_DESKTOP_BRIDGE_URI}`,
  { reconnect: true }
);

const client = new Client({
  url: `http://{import.meta.env.VITE_API_GATEWAY_URI}/graphql`,
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
