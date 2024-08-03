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

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
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
