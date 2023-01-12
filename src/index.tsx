import React from "react";
import ReactDOM from "react-dom";
import { Client, subscriptionExchange, Provider, Operation, makeOperation, fetchExchange } from "urql";
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
import { authExchange } from '@urql/exchange-auth';

const subscriptionClient = new SubscriptionClient(
  `${Config.API_GATEWAY_WS_URI}/graphql`,
  {
    lazy: true,
    reconnect: true,
    connectionParams: () => {
      if (keycloak.token) {
        // This is an edge case where the token has not been refreshed correctly
        // and we need to issue a new one. This is done async, so it might first be on
        // the next connection that the new token is used.
        keycloak.updateToken(30);
      }

      return {
        Authorization: `Bearer ${keycloak.token}`,
      };
    },
  }
);

const withAuthHeader = (operation: Operation, token: string) => {
  const fetchOptions =
    typeof operation.context.fetchOptions === 'function'
      ? operation.context.fetchOptions()
      : operation.context.fetchOptions || {};

  return makeOperation(operation.kind, operation, {
    ...operation.context,
    fetchOptions: {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        Authorization: token,
      },
    },
  });
};

const getAuth = async () => {
  // First time the application loads, the keycloak token is not set.
  // When the servers returns unauthorized, we get a new token.
  if (!keycloak.token) {
    return { token: "" }
  }

  return await keycloak.updateToken(30).then(() => {
    if (keycloak.token) {
      return { token: `Bearer ${keycloak.token}` };
    }
  }).catch(() => {
    console.error("Could not update token. Logging user out...");
    keycloak.logout();
  });
}

const client = new Client({
  url: `${Config.API_GATEWAY_HTTP_URI}/graphql`,
  requestPolicy: "network-only",
  exchanges: [
    authExchange({
      getAuth: getAuth,
      didAuthError: ({ error }) => {
        return error.graphQLErrors.some(e => e.extensions?.code === "ACCESS_DENIED");
      },
      addAuthToOperation: ({ authState, operation }) => {
        return withAuthHeader(operation, authState!.token);
      },
    }),
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: (operation: any) => subscriptionClient.request(operation),
    }),
  ],
});

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider authClient={keycloak} autoRefreshToken={true}>
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
