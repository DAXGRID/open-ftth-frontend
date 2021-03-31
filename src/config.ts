declare global {
  interface Window {
    config_API_GATEWAY_HTTP_URI: string;
    config_API_GATEWAY_WS_URI: string;
    config_DESKTOP_BRIDGE_URI: string;
    config_KEYCLOAK_URI: string;
    config_COLOR_OPTIONS: string[];
  }
}

const settings = {
  API_GATEWAY_HTTP_URI: window.config_API_GATEWAY_HTTP_URI,
  API_GATEWAY_WS_URI: window.config_API_GATEWAY_WS_URI,
  DESKTOP_BRIDGE_URI: window.config_DESKTOP_BRIDGE_URI,
  KEYCLOAK_URI: window.config_KEYCLOAK_URI,
  COLOR_OPTIONS: window.config_COLOR_OPTIONS,
};

export default settings;
