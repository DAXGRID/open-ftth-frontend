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
          },
          geometry: feature.geometry,
        },
      ],
    },
  };
}

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
  MultiConduitOrange: {
    type: "fill",
    order: 1,
    paint: {
      "fill-color": colorMap["ORANGE"],
      "fill-outline-color": "#555",
    },
  },
  MultiConduitRed: {
    type: "fill",
    order: 1,
    paint: {
      "fill-color": colorMap["RED"],
      "fill-outline-color": "#555",
    },
  },
  BigConduitRed: {
    type: "fill",
    order: 1,
    paint: {
      "fill-color": colorMap["RED"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitBlue: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["BLUE"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitOrange: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["ORANGE"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitGreen: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["GREEN"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitBrown: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["BROWN"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitGrey: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["GREY"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitWhite: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["WHITE"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitRed: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["RED"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitBlack: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["BLACK"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitYellow: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["YELLOW"],
      "fill-outline-color": "#555",
    },
  },
  InnerConduitViolet: {
    type: "fill",
    order: 2,
    paint: {
      "fill-color": colorMap["VIOLET"],
      "fill-outline-color": "#555",
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
