import Keycloak from "keycloak-js";

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = Keycloak({
  url: "http://10.105.173.49/auth",
  realm: "openftth",
  clientId: "openftth-frontend",
});

export default keycloak;
