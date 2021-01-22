import Keycloak from "keycloak-js";

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = Keycloak({
  url: "http://10.104.78.38/auth",
  realm: "openftth",
  clientId: "openftth-frontend",
});

export default keycloak;
