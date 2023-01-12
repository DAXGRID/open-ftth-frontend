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

const INITIAL_KEYCLOAK_DELAY = 300;

function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => { resolve('') }, ms);
  });
}

const subscriptionClient = new SubscriptionClient(
  `${Config.API_GATEWAY_WS_URI}/graphql`,
  {
    lazy: false,
    reconnect: true,
    connectionParams: async () => {
      // First time the application loads, the keycloak is not initalized.
      // One way to figure out if it is, is by checking if the initial token has beens set.
      // We wait `n` amount of time, before sending the initial request.
      // This is quite ugly, but this is how it is done for now.
      if (!keycloak.token) {
        await delay(INITIAL_KEYCLOAK_DELAY);
      }

      if (keycloak.token) {
        // This is an edge case where the token has not been refreshed correctly
        // and we need to issue a new one.
        await keycloak.updateToken(30);
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
  // First time the application loads, the keycloak is not initalized.
  // One way to figure out if it is, is by checking if the initial token has beens set.
  // We wait `n` amount of time, before sending the initial request.
  // This is quite ugly, but this is how it is done for now.
  if (!keycloak.token) {
    await delay(INITIAL_KEYCLOAK_DELAY);
  }

  // If the tokens has not been set after `n` amount of time, we just return
  // an empty token, this will result in a new token been issued.
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
      forwardSubscription: (operation) => subscriptionClient.request(operation),
    }),
  ],
});

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider authClient={keycloak} autoRefreshToken={false}>
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
