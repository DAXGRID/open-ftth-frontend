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
  redirect_uri: Config.AUTH_REDIRECT_URL,
};

// This is used to clear the history after the sign-in redirect.
const onSigninCallback = (_user: any | void): void => {
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  )
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
