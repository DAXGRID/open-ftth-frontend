import colorMap from "./colors";
import {
  AnyLayer,
  FillLayer,
  LineLayer,
  SymbolLayer,
  GeoJSONSourceRaw,
} from "maplibre-gl";
import { Feature, GeoJsonProperties, Geometry } from "geojson";

export function createSource(
  features: Feature<Geometry, GeoJsonProperties>[]
): GeoJSONSourceRaw {
  const source: GeoJSONSourceRaw = {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: features,
    },
  };

  return source;
}

export function createFeature(
  id: number,
  label: string,
  geometryType: any,
  coordinate: any,
  style: string,
  refId: string,
  drawingOrder: number
): Feature<Geometry, GeoJsonProperties> {
  return {
    id: id,
    type: "Feature",
    geometry: {
      type: geometryType,
      coordinates: JSON.parse(coordinate),
    },
    properties: {
      label: label,
      type: style,
      refId: refId,
      drawingOrder: drawingOrder,
    },
  };
}

export function getLayer(name: string): AnyLayer {
  switch (name) {
    case "FiberCable": {
      return {
        id: "FiberCable",
        source: "FiberCable",
        type: "line",
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0, 22, 20],
          "line-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            colorMap.LIGHT_BLUE,
            colorMap.WHITE,
          ],
        },
      } as LineLayer;
    }
    case "NodeContainerSideNorth":
    case "NodeContainerSideSouth":
    case "NodeContainerSideEast":
    case "NodeContainerSideWest":
      return {
        id: "NodeContainerSide",
        source: "NodeContainerSide",
        type: "line",
        layout: {
          "line-cap": "round",
        },
        paint: {
          "line-width": 15,
          "line-color": "black",
          "line-opacity": 0,
        },
      } as LineLayer;
    case "NodeContainer":
      return {
        id: "NodeContainer",
        source: "NodeContainer",
        type: "fill",
        paint: {
          "fill-color": "#e1e1e1",
          "fill-outline-color": "black",
        },
      } as FillLayer;
    case "Rack":
      return {
        id: "Rack",
        source: "Rack",
        type: "fill",
        paint: {
          "fill-color": "white",
          "fill-outline-color": "black",
        },
      } as FillLayer;
    case "SubrackSpace":
      return {
        id: "SubrackSpace",
        source: "SubrackSpace",
        type: "fill",
        paint: {
          "fill-color": "#ccf1cc",
          "fill-outline-color": "black",
        },
      } as FillLayer;
    case "OuterConduitOrange":
    case "OuterConduitRed":
    case "OuterConduitGreen":
    case "OuterConduitBlue":
    case "OuterConduitWhite":
    case "OuterConduitSilver":
    case "OuterConduitTurquoise":
    case "OuterConduitBlack":
    case "OuterConduitBrown":
    case "OuterConduitViolet":
    case "OuterConduitPink":
    case "OuterConduitYellow":
      return {
        id: "OuterConduit",
        source: "OuterConduit",
        type: "fill",
        paint: {
          "fill-outline-color": "#555",
          "fill-color": [
            "match",
            ["get", "type"],
            "OuterConduitOrange",
            colorMap.LIGHT_ORANGE,
            "OuterConduitRed",
            colorMap.LIGHT_RED,
            "OuterConduitGreen",
            colorMap.LIGHT_GREEN,
            "OuterConduitBlue",
            colorMap.LIGHT_BLUE,
            "OuterConduitWhite",
            colorMap.WHITE,
            "OuterConduitSilver",
            colorMap.LIGHT_GREY,
            "OuterConduitTurquoise",
            colorMap.LIGHT_TURQUOISE,
            "OuterConduitBlack",
            colorMap.BLACK,
            "OuterConduitBrown",
            colorMap.LIGHT_BROWN,
            "OuterConduitViolet",
            colorMap.LIGHT_VIOLET,
            "OuterConduitPink",
            colorMap.LIGHT_PINK,
            "OuterConduitYellow",
            colorMap.LIGHT_YELLOW,
            "#ccc",
          ],
        },
      } as FillLayer;
    case "InnerConduitBlue":
    case "InnerConduitOrange":
    case "InnerConduitGreen":
    case "InnerConduitBrown":
    case "InnerConduitSilver":
    case "InnerConduitWhite":
    case "InnerConduitRed":
    case "InnerConduitBlack":
    case "InnerConduitYellow":
    case "InnerConduitViolet":
    case "InnerConduitPink":
    case "InnerConduitTurquoise":
      return {
        id: "InnerConduit",
        source: "InnerConduit",
        type: "fill",
        paint: {
          "fill-outline-color": "#555",
          "fill-color": [
            "match",
            ["get", "type"],
            "InnerConduitBlue",
            colorMap.BLUE,
            "InnerConduitOrange",
            colorMap.ORANGE,
            "InnerConduitGreen",
            colorMap.GREEN,
            "InnerConduitBrown",
            colorMap.BROWN,
            "InnerConduitSilver",
            colorMap.GREY,
            "InnerConduitWhite",
            colorMap.WHITE,
            "InnerConduitRed",
            colorMap.RED,
            "InnerConduitBlack",
            colorMap.BLACK,
            "InnerConduitYellow",
            colorMap.YELLOW,
            "InnerConduitViolet",
            colorMap.VIOLET,
            "InnerConduitPink",
            colorMap.PINK,
            "InnerConduitTurquoise",
            colorMap.TURQUOISE,
            "#ccc",
          ],
        },
      } as FillLayer;
    case "TerminalEquipmentWithProperties":
    case "TerminalEquipment":
      return {
        id: "TerminalEquipment",
        source: "TerminalEquipment",
        type: "fill",
        paint: {
          "fill-color": "#f4f6f8",
          "fill-outline-color": "black",
        },
      } as FillLayer;
    case "WestTerminalLabel":
      return {
        id: "WestTerminalLabel",
        source: "WestTerminalLabel",
        type: "symbol",
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "right",
          "text-justify": "right",
          "text-offset": [-0.5, 0],
          "text-max-width": 1000,
        },
      } as SymbolLayer;
    case "EastTerminalLabel":
      return {
        id: "EastTerminalLabel",
        source: "EastTerminalLabel",
        type: "symbol",
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-offset": [0.5, 0],
          "text-max-width": 1000,
        },
      } as SymbolLayer;
    case "SouthTerminalLabel":
      return {
        id: "SouthTerminalLabel",
        source: "SouthTerminalLabel",
        type: "symbol",
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "right",
          "text-justify": "right",
          "text-rotate": -90,
          "text-offset": [-0.5, 0],
          "text-max-width": 1000,
        },
      } as SymbolLayer;
    case "NorthTerminalLabel":
      return {
        id: "NorthTerminalLabel",
        source: "NorthTerminalLabel",
        type: "symbol",
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-rotate": -90,
          "text-offset": [0.5, 0],
          "text-max-width": 1000,
        },
      } as SymbolLayer;
    case "SpanEquipmentLabel":
      return {
        id: "SpanEquipmentLabel",
        source: "SpanEquipmentLabel",
        type: "symbol",
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-rotate": 0,
          "text-offset": [0, 0],
          "text-max-width": 1000,
        },
      } as SymbolLayer;
    case "NodeContainerLabel":
      return {
        id: "NodeContainerLabel",
        source: "NodeContainerLabel",
        type: "symbol",
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 16,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-rotate": 0,
          "text-offset": [0, -0.5],
          "text-max-width": 1000,
        },
      } as SymbolLayer;
    case "RackLabel":
      return {
        id: "RackLabel",
        source: "RackLabel",
        type: "symbol",
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 18,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-rotate": 0,
          "text-offset": [0, -0.25],
          "text-max-width": 1000,
        },
      } as SymbolLayer;
    case "RackUnitLabel":
      return {
        id: "RackUnitLabel",
        source: "RackUnitLabel",
        type: "symbol",
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": false,
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "right",
          "text-justify": "right",
          "text-offset": [-0.75, 0],
          "text-max-width": 1000,
        },
      } as SymbolLayer;
    case "TerminalEquipmentNameLabel":
      return {
        id: "TerminalEquipmentNameLabel",
        source: "TerminalEquipmentNameLabel",
        type: "symbol",
        minzoom: 12,
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": false,
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "center",
          "text-justify": "center",
          "text-offset": [0, 0],
          "text-max-width": 100000,
        },
      } as SymbolLayer;
    case "TerminalEquipmentTypeLabel":
      return {
        id: "TerminalEquipmentTypeLabel",
        source: "TerminalEquipmentTypeLabel",
        type: "symbol",
        minzoom: 13,
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": false,
          "text-size": 12,
          "text-font": ["Open Sans Bold"],
          "text-field": ["get", "label"],
          "text-anchor": "center",
          "text-justify": "center",
          "text-offset": [0, 0],
          "text-max-width": 20,
        },
      } as SymbolLayer;
    default:
      throw new Error(`The following style is not supported '${name}'`);
  }
}

export const nodeContainerSideSelect: LineLayer = {
  id: "NodeContainerSideSelect",
  type: "line",
  source: "NodeContainerSide",
  layout: {
    "line-cap": "butt",
  },
  paint: {
    "line-width": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      8,
      0.5,
    ],
    "line-color": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      colorMap.LIGHT_BLUE,
      colorMap.BLACK,
    ],
  },
};

export const innerConduitSelect: LineLayer = {
  id: "InnerConduitSelect",
  type: "line",
  source: "InnerConduit",
  paint: {
    "line-width": 3,
    "line-color": colorMap.LIGHT_BLUE,
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      1,
      0,
    ],
  },
};

export const outerConduitSelect: LineLayer = {
  id: "OuterConduitSelect",
  type: "line",
  source: "OuterConduit",
  paint: {
    "line-width": 3,
    "line-color": colorMap.LIGHT_BLUE,
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      1,
      0,
    ],
  },
};

export const nodeContainerSelect: LineLayer = {
  id: "NodeContainerSelect",
  type: "line",
  source: "NodeContainer",
  paint: {
    "line-width": 4,
    "line-color": colorMap.LIGHT_BLUE,
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      1,
      0,
    ],
  },
};

export const rackSelect: LineLayer = {
  id: "RackSelect",
  type: "line",
  source: "Rack",
  paint: {
    "line-width": 4,
    "line-color": colorMap.LIGHT_BLUE,
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      1,
      0,
    ],
  },
};

export const terminalEquipmentSelect: LineLayer = {
  id: "TerminalEquipmentSelect",
  type: "line",
  source: "TerminalEquipment",
  paint: {
    "line-width": 2,
    "line-color": colorMap.LIGHT_BLUE,
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      1,
      0,
    ],
  },
};

export const fiberCableSymbolLayer: SymbolLayer = {
  id: "FiberCableLabel",
  type: "symbol",
  source: "FiberCable",
  layout: {
    "symbol-placement": "line-center",
    "text-font": ["Open Sans Regular"],
    "text-field": "{label}",
    "text-size": 14,
  },
  paint: {
    "text-color": "rgba(0, 0, 0, 1)",
    "text-halo-blur": 1,
    "text-halo-color": "rgba(255, 255, 255, 1)",
    "text-halo-width": 10,
    "text-translate": [0, 0],
  },
};

export const fiberCableUnderLayer: LineLayer = {
  id: "FiberCableUnderLayer",
  source: "FiberCable",
  type: "line",
  paint: {
    "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0, 20, 5],
    "line-color": colorMap.BLACK,
  },
};
