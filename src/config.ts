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
    styleLayerName: string | null;
    body: string;
    filter: {
      property: string;
      value: string;
    } | null;
  }[];
}

interface IntitialUserPrompt {
  message: string;
  linkUrl: string;
  linkText: string;
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
    config_DEFAULT_USER_LANGUAGE: string;
    config_INITIAL_USER_PROMPT: IntitialUserPrompt | null;
    AUTH_REDIRECT_URL: string;
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
  DEFAULT_USER_LANGUAGE: window.config_DEFAULT_USER_LANGUAGE ?? "en",
  // The initial user prompt has been made because some customers want an
  // initial prompt to be displayed to the user when they first time visit the site.
  INITIAL_USER_PROMPT: window.config_INITIAL_USER_PROMPT,
  AUTH_REDIRECT_URL: window.location.origin
};

export default settings;
