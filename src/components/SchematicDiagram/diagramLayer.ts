import colorMap from "./colors";
import {
  AnyLayer,
  FillLayer,
  LineLayer,
  SymbolLayer,
  GeoJSONSourceRaw,
} from "mapbox-gl";

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
  refId: string
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
    },
  };
}

export function getLayer(name: string): AnyLayer {
  switch (name) {
    case "NodeContainerSideNorth":
    case "NodeContainerSideSouth":
    case "NodeContainerSideEast":
    case "NodeContainerSideWest":
      return {
        id: "NodeContainerSide",
        source: "NodeContainerSide",
        order: 0,
        type: "line",
        layout: {
          "line-cap": "round",
        },
        paint: {
          "line-width": 10,
          "line-color": "#CDCDCD",
          "line-opacity": 0,
        },
      } as LineLayer;
    case "NodeContainer":
      return {
        id: "NodeContainer",
        source: "NodeContainer",
        order: 0,
        type: "fill",
        paint: {
          "fill-color": "#CDCDCD",
        },
      } as FillLayer;
    case "OuterConduitOrange":
    case "OuterConduitRed":
      return {
        id: "OuterConduit",
        source: "OuterConduit",
        order: 1,
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
      return {
        id: "InnerConduit",
        source: "InnerConduit",
        order: 2,
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
            "#ccc",
          ],
        },
      } as FillLayer;
    case "WestTerminalLabel":
      return {
        id: "WestTerminalLabel",
        source: "WestTerminalLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-anchor": "right",
          "text-justify": "right",
          "text-offset": [-0.5, 0],
        },
      } as SymbolLayer;
    case "EastTerminalLabel":
      return {
        id: "EastTerminalLabel",
        source: "EastTerminalLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-offset": [0.5, 0],
        },
      } as SymbolLayer;
    case "SouthTerminalLabel":
      return {
        id: "SouthTerminalLabel",
        source: "SouthTerminalLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-anchor": "right",
          "text-justify": "right",
          "text-rotate": -90,
          "text-offset": [-0.5, 0],
        },
      } as SymbolLayer;
    case "NorthTerminalLabel":
      return {
        id: "NorthTerminalLabel",
        source: "NorthTerminalLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-rotate": -90,
          "text-offset": [0.5, 0],
        },
      } as SymbolLayer;
    case "SpanEquipmentLabel":
      return {
        id: "SpanEquipmentLabel",
        source: "SpanEquipmentLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-rotate": 0,
          "text-offset": [0, 0],
        },
      } as SymbolLayer;
    case "NodeContainerLabel":
      return {
        id: "NodeContainerLabel",
        source: "NodeContainerLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-color": "#444",
        },
        layout: {
          "text-allow-overlap": true,
          "text-size": 14,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-anchor": "left",
          "text-justify": "left",
          "text-rotate": 0,
          "text-offset": [0, 0],
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
    "line-width": 10,
    "line-color": colorMap.LIGHT_BLUE,
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      1,
      0,
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
