interface LayerConfig {
  name: string;
  layerGroups: {
    text: string;
    layers: string[];
  }[];
}

interface InformationControlConfig {
  sourceLayers: {
    layer: string;
    body: string;
    filter: {
      property: string;
      value: string;
    } | null;
  }[];
}

declare global {
  interface Window {
    config_API_GATEWAY_HTTP_URI: string;
    config_API_GATEWAY_WS_URI: string;
    config_DESKTOP_BRIDGE_URI: string;
    config_KEYCLOAK_URI: string;
    config_COLOR_OPTIONS: string[];
    config_LAYERS: LayerConfig[];
    config_INFORMATION_CONTROL_CONFIG: InformationControlConfig;
  }
}

const settings = {
  API_GATEWAY_HTTP_URI: window.config_API_GATEWAY_HTTP_URI,
  API_GATEWAY_WS_URI: window.config_API_GATEWAY_WS_URI,
  DESKTOP_BRIDGE_URI: window.config_DESKTOP_BRIDGE_URI,
  KEYCLOAK_URI: window.config_KEYCLOAK_URI,
  COLOR_OPTIONS: window.config_COLOR_OPTIONS,
  LAYERS: window.config_LAYERS ?? [],
  INFORMATION_CONTROL_CONFIG: window.config_INFORMATION_CONTROL_CONFIG ?? null,
};

export default settings;
