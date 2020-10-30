import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Client, defaultExchanges, subscriptionExchange, Provider } from "urql";
import Transport from "subscriptions-transport-ws";
import "./translation/i18n";

import "./global-styles/reset.scss";
import "./global-styles/index.scss";

const subscriptionClient = new Transport.SubscriptionClient(
  "ws://10.109.134.174/graphql",
  { reconnect: true }
);

const client = new Client({
  url: "http://10.109.134.174/graphql",
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
