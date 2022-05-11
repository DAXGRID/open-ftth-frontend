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
import { MapProvider } from "./contexts/MapContext";
import { UserProvider } from "./contexts/UserContext";
import { OverlayProvider } from "./contexts/OverlayContext";

const getKeycloakToken = (): string | null => {
  if (keycloak.token && keycloak.authenticated && !keycloak.isTokenExpired()) {
    return keycloak.token;
  } else {
    keycloak.logout();
    return null;
  }
};

const subscriptionClient = new SubscriptionClient(
  `${Config.API_GATEWAY_WS_URI}/graphql`,
  {
    lazy: true,
    reconnect: true,
    connectionParams: () => {
      const token = getKeycloakToken();
      return token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};
    },
  }
);

const client = new Client({
  url: `${Config.API_GATEWAY_HTTP_URI}/graphql`,
  requestPolicy: "network-only",
  fetchOptions: () => {
    const token = getKeycloakToken();
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  },
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription: (operation) => subscriptionClient.request(operation),
    }),
  ],
});

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider authClient={keycloak}>
      <Provider value={client}>
        <UserProvider>
          <MapProvider>
            <OverlayProvider>
              <App />
            </OverlayProvider>
          </MapProvider>
        </UserProvider>
      </Provider>
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
