import colorMap from "./colors";

export function createLayer(featureType) {
  let layer = {
    id: featureType,
    order: 0,
    source: featureType,
  };

  let styleProps = layerPropsForStyle[featureType];
  if (!styleProps) {
    styleProps = layerPropsForStyle["default"];
  }

  layer = {
    ...layer,
    ...styleProps,
  };

  return layer;
}

export function createSource(feature) {
  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            label: feature.label,
            type: feature.style,
            refId: feature.refId,
          },
          geometry: feature.geometry,
        },
      ],
    },
  };
}

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
      colorMap["DARK_WHITE"],
      "InnerConduitBrown",
      colorMap["DARK_BROWN"],
      "InnerConduitRed",
      colorMap["DARK_RED"],
      "InnerConduitYellow",
      colorMap["DARK_YELLOW"],
      "InnerConduitBlue",
      colorMap["DARK_BLUE"],
      "InnerConduitOrange",
      colorMap["DARK_ORANGE"],
      "InnerConduitGreen",
      colorMap["DARK_GREEN"],
      "InnerConduitBlack",
      colorMap["LIGHT_BLACK"],
      "InnerConduitGrey",
      colorMap["DARK_GREY"],
      "InnerConduitViolet",
      colorMap["DARK_VIOLET"],
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
      colorMap["DARK_ORANGE"],
      "MultiConduitRed",
      colorMap["DARK_RED"],
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

const layerPropsForStyle = {
  Well: {
    type: "line",
    order: 0,
    paint: {
      "line-width": 3,
      "line-color": "#555",
    },
  },
  WellFill: {
    type: "fill",
    order: 0,
    paint: {
      "fill-color": "#ccc",
    },
  },
  MultiConduit: {
    type: "fill",
    order: 1,
    paint: {
      "fill-outline-color": "#555",
      "fill-color": [
        "match",
        ["get", "type"],
        "MultiConduitOrange",
        colorMap["LIGHT_ORANGE"],
        "MultiConduitRed",
        colorMap["LIGHT_RED"],
        "#ccc",
      ],
    },
  },
  InnerConduit: {
    type: "fill",
    order: 2,
    paint: {
      "fill-outline-color": "#555",
      "fill-color": [
        "match",
        ["get", "type"],
        "InnerConduitBlue",
        colorMap["BLUE"],
        "InnerConduitOrange",
        colorMap["ORANGE"],
        "InnerConduitGreen",
        colorMap["GREEN"],
        "InnerConduitBrown",
        colorMap["BROWN"],
        "InnerConduitGrey",
        colorMap["GREY"],
        "InnerConduitWhite",
        colorMap["WHITE"],
        "InnerConduitRed",
        colorMap["RED"],
        "InnerConduitBlack",
        colorMap["BLACK"],
        "InnerConduitYellow",
        colorMap["YELLOW"],
        "InnerConduitViolet",
        colorMap["VIOLET"],
        "#ccc",
      ],
    },
  },
  CableInsideWell: {
    type: "line",
    order: 3,
    paint: {
      "line-width": 2,
      "line-color": "#000",
    },
  },
  CableOutsideWell: {
    type: "line",
    order: 3,
    paint: {
      "line-width": 2,
      "line-color": "#000",
    },
  },
  CableOutsideWellLabel: {
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
  },
  CableInsideWellLabel: {
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
  },
  LabelMediumText: {
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
  },
  LabelNormalText: {
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
  },
  LabelBigText: {
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
  },
  default: {
    type: "line",
    paint: {
      "line-width": 3,
      "line-color": "#000",
    },
  },
};
