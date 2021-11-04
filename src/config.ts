type LayerConfig = {
  name: string;
  layerGroups: {
    text: string;
    layers: string[];
  }[];
  layer: any;
};

declare global {
  interface Window {
    config_API_GATEWAY_HTTP_URI: string;
    config_API_GATEWAY_WS_URI: string;
    config_DESKTOP_BRIDGE_URI: string;
    config_KEYCLOAK_URI: string;
    config_ROUTE_NETWORK_TILE_SERVER_URI: string;
    config_BASEMAP_TILE_SERVER_URI: string;
    config_AERIAL_PHOTO_SERVER_URI: string;
    config_COLOR_OPTIONS: string[];
    config_LAYERS: LayerConfig[];
  }
}

const settings = {
  API_GATEWAY_HTTP_URI: window.config_API_GATEWAY_HTTP_URI,
  API_GATEWAY_WS_URI: window.config_API_GATEWAY_WS_URI,
  DESKTOP_BRIDGE_URI: window.config_DESKTOP_BRIDGE_URI,
  KEYCLOAK_URI: window.config_KEYCLOAK_URI,
  ROUTE_NETWORK_TILE_SERVER_URI: window.config_ROUTE_NETWORK_TILE_SERVER_URI,
  BASEMAP_TILE_SERVER_URI: window.config_BASEMAP_TILE_SERVER_URI,
  AERIAL_PHOTO_SERVER_URI: window.config_AERIAL_PHOTO_SERVER_URI,
  COLOR_OPTIONS: window.config_COLOR_OPTIONS,
  LAYERS: window.config_LAYERS ?? [],
};

export default settings;
