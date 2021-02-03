import Keycloak from "keycloak-js";
import Config from "./config";

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = Keycloak({
  url: Config.KEYCLOAK_URI,
  realm: "openftth",
  clientId: "openftth-frontend",
});

export default keycloak;
