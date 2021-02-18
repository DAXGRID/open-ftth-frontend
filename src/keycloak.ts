import Keycloak from "keycloak-js";
import Config from "./config";

const keycloak = Keycloak({
  url: Config.KEYCLOAK_URI,
  realm: "openftth",
  clientId: "openftth-frontend",
});

export default keycloak;
