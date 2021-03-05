import colorMap from "./colors";
import {
  AnyLayer,
  FillLayer,
  LineLayer,
  SymbolLayer,
  GeoJSONSourceRaw,
} from "mapbox-gl";

import { Feature, GeoJsonProperties, Geometry, Position } from "geojson";

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
  label: string,
  geometryType: any,
  coordinate: any,
  style: string,
  refId: string
): Feature<Geometry, GeoJsonProperties> {
  return {
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
    case "Well":
      return {
        id: "Well",
        source: "Well",
        order: 0,
        type: "line",
        paint: {
          "line-width": 3,
          "line-color": "#555",
        },
      } as LineLayer;
    case "WellFill":
      return {
        id: "WellFill",
        source: "WellFill",
        order: 0,
        type: "fill",
        paint: {
          "fill-color": "#ccc",
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
            "OuterconduitRed",
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
    case "InnerConduitSilver":
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
    case "CableInsideWell":
      return {
        id: "CableInsideWell",
        source: "CableInsideWell",
        type: "line",
        order: 3,
        paint: {
          "line-width": 2,
          "line-color": "#000",
        },
      } as LineLayer;
    case "CableOutsideWell":
      return {
        id: "CableOutsideWell",
        name: "CableOutsideWell",
        type: "line",
        order: 3,
        paint: {
          "line-width": 2,
          "line-color": "#000",
        },
      } as LineLayer;
    case "CableOutsideWellLabel":
      return {
        id: "CableOutsideWellLabel",
        name: "CableOutsideWellLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-halo-width": 2,
          "text-color": "#444",
          "text-halo-color": "#fff",
        },
        layout: {
          "symbol-placement": "line-center",
          "text-size": 10,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-allow-overlap": true,
          "icon-padding": 0,
        },
      } as SymbolLayer;
    case "CableInsideWellLabel":
      return {
        id: "CableInsideWellLabel",
        source: "CableInsideWellLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-halo-width": 2,
          "text-color": "#444",
          "text-halo-color": "#fff",
        },
        layout: {
          "symbol-placement": "line-center",
          "text-size": 10,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
        },
      } as SymbolLayer;
    case "LabelMediumText":
      return {
        id: "LabelMediumText",
        source: "LabelMediumText",
        type: "symbol",
        order: 4,
        paint: {
          "text-halo-width": 2,
          "text-color": "#444",
          "text-halo-color": "#fff",
        },
        layout: {
          "symbol-placement": "line-center",
          "text-size": 10,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-allow-overlap": true,
          "icon-padding": 0,
        },
      } as SymbolLayer;
    case "LabelNormalText":
      return {
        id: "LabelNormalText",
        source: "LabelNormalText",
        type: "symbol",
        order: 4,
        paint: {
          "text-halo-width": 2,
          "text-color": "#444",
          "text-halo-color": "#fff",
        },
        layout: {
          "symbol-placement": "line-center",
          "text-size": 8,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-allow-overlap": true,
          "icon-padding": 0,
        },
      } as SymbolLayer;
    case "LabelBigText":
      return {
        id: "LabelBigText",
        source: "LabelBigText",
        type: "symbol",
        order: 4,
        paint: {
          "text-halo-width": 2,
          "text-color": "#444",
          "text-halo-color": "#fff",
        },
        layout: {
          "symbol-placement": "line-center",
          "text-size": 12,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-allow-overlap": true,
          "icon-padding": 0,
        },
      } as SymbolLayer;
    case "VestTerminalLabel":
      return {
        id: "VestTerminalLabel",
        source: "VestTerminalLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-halo-width": 2,
          "text-color": "#444",
          "text-halo-color": "#fff",
        },
        layout: {
          "symbol-placement": "line-center",
          "text-size": 8,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-allow-overlap": true,
          "icon-padding": 0,
        },
      } as SymbolLayer;
    case "EastTerminalLabel":
      return {
        id: "EastTerminalLabel",
        source: "EastTerminalLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-halo-width": 2,
          "text-color": "#444",
          "text-halo-color": "#fff",
        },
        layout: {
          "symbol-placement": "line-center",
          "text-size": 8,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-allow-overlap": true,
          "icon-padding": 0,
        },
      } as SymbolLayer;
    case "SpanEquipmentLabel":
      return {
        id: "SpanEquipmentLabel",
        source: "SpanEquipmentLabel",
        type: "symbol",
        order: 4,
        paint: {
          "text-halo-width": 2,
          "text-color": "#444",
          "text-halo-color": "#fff",
        },
        layout: {
          "symbol-placement": "line-center",
          "text-size": 8,
          "text-font": ["PT Sans Narrow Bold", "Arial Unicode MS Regular"],
          "text-field": ["get", "label"],
          "text-allow-overlap": true,
          "icon-padding": 0,
        },
      } as SymbolLayer;
    default:
      throw new Error(`Style is not supported ${name}`);
  }
}

export const innerConduitSelect = {
  id: "inner-conduit-select",
  type: "line",
  source: "InnerConduit",
  paint: {
    "line-width": 3,
    "line-color": "#71D3FC",
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      1,
      0,
    ],
  },
};

export const innerConduitHighlight = {
  id: "inner-conduit-highlight",
  type: "fill",
  source: "InnerConduit",
  paint: {
    "fill-outline-color": "#555",
    "fill-color": [
      "match",
      ["get", "type"],
      "InnerConduitWhite",
      colorMap.DARK_WHITE,
      "InnerConduitBrown",
      colorMap.DARK_BROWN,
      "InnerConduitRed",
      colorMap.DARK_RED,
      "InnerConduitYellow",
      colorMap.DARK_YELLOW,
      "InnerConduitBlue",
      colorMap.DARK_BLUE,
      "InnerConduitOrange",
      colorMap.DARK_ORANGE,
      "InnerConduitGreen",
      colorMap.DARK_GREEN,
      "InnerConduitBlack",
      colorMap.LIGHT_BLACK,
      "InnerConduitGrey",
      colorMap.DARK_GREY,
      "InnerConduitViolet",
      colorMap.DARK_VIOLET,
      "#000",
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      0,
    ],
  },
};

export const multiConduitSelect = {
  id: "multi-conduit-select",
  type: "line",
  source: "MultiConduit",
  paint: {
    "line-width": 3,
    "line-color": "#71D3FC",
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "selected"], false],
      1,
      0,
    ],
  },
};

export const multiConduitHighlight = {
  id: "multi-conduit-highlight",
  type: "fill",
  source: "MultiConduit",
  paint: {
    "fill-outline-color": "#555",
    "fill-color": [
      "match",
      ["get", "type"],
      "MultiConduitOrange",
      colorMap.DARK_ORANGE,
      "MultiConduitRed",
      colorMap.DARK_RED,
      "#000",
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      0,
    ],
  },
};
