import React from "react";
import ReactDOM from "react-dom";
import { AuthProvider } from "react-oidc-context";
import App from "./App";
import Config from "./config";
import "./translation/i18n";
import "./global-styles/reset.scss";
import "./global-styles/index.scss";
import { MapProvider } from "./contexts/MapContext";
import { UserProvider } from "./contexts/UserContext";
import { OverlayProvider } from "./contexts/OverlayContext";
import { AuthWrapperProvider } from "./contexts/AuthWrapperContext";

const oidcConfig = {
  authority: `${Config.KEYCLOAK_URI}/realms/openftth`,
  client_id: "openftth-frontend",
  redirect_uri: window.location.href,
};

// This is used to clear the history after the sign-in redirect.
const onSigninCallback = (_user: any | void): void => {
  const url = new URL(window.location.href);
  if (url.searchParams.has('state') && url.searchParams.has('session_state') && url.searchParams.has('iss') && url.searchParams.has('code')) {
    url.searchParams.delete('state');
    url.searchParams.delete('session_state');
    url.searchParams.delete('iss');
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());
  }
}

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      <AuthWrapperProvider>
        <UserProvider>
          <MapProvider>
            <OverlayProvider>
              <App />
            </OverlayProvider>
          </MapProvider>
        </UserProvider>
      </AuthWrapperProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
