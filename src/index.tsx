import React from "react";
import ReactDOM from "react-dom";
import { Client, defaultExchanges, subscriptionExchange, Provider } from "urql";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { SubscriptionClient } from "subscriptions-transport-ws";
import App from "./App";
import Config from "./config";
import keycloak from "./keycloak";
import "./translation/i18n";
import "./global-styles/reset.scss";
import "./global-styles/index.scss";

const subscriptionClient = new SubscriptionClient(
  `${Config.API_GATEWAY_WS_URI}/graphql`,
  {
    reconnect: true,
  }
);

const client = new Client({
  url: `${Config.API_GATEWAY_HTTP_URI}/graphql`,
  requestPolicy: "network-only",
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
    <ReactKeycloakProvider authClient={keycloak}>
      <Provider value={client}>
        <App />
      </Provider>
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
