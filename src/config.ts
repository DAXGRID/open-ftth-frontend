declare global {
  interface Window {
    config_MAPBOX_API_KEY: string;
    config_MAPBOX_STYLE_URL: string;
    config_API_GATEWAY_URI: string;
    config_DESKTOP_BRIDGE_URI: string;
    config_KEYCLOAK_URI: string;
  }
}

const settings = {
  MAPBOX_API_KEY: window.config_MAPBOX_API_KEY,
  MAPBOX_STYLE_URI: window.config_MAPBOX_STYLE_URL,
  API_GATEWAY_URI: window.config_API_GATEWAY_URI,
  DESKTOP_BRIDGE_URI: window.config_DESKTOP_BRIDGE_URI,
  KEYCLOAK_URI: window.config_KEYCLOAK_URI,
};

export default settings;
