import React from "react";
import ReactDOM from "react-dom";
import { Client, defaultExchanges, subscriptionExchange, Provider } from "urql";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import Transport from "subscriptions-transport-ws";
import App from "./App";
import Config from "./config";
import "./translation/i18n";
import "./global-styles/reset.scss";
import "./global-styles/index.scss";
import keycloak from "./keycloak";

const subscriptionClient = new Transport.SubscriptionClient(
  `ws://${Config.API_GATEWAY_URI}/graphql`,
  { reconnect: true }
);

const client = new Client({
  url: `http://${Config.API_GATEWAY_URI}/graphql`,
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
