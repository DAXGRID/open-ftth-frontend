import colorMap from "./colors";
type DiagramStyleType = "line" | "fill" | "symbol";

export interface Style {
  type: DiagramStyleType;
  order?: number;
  paint: {
    "text-halo-color"?: string;
    "text-halo-width"?: number;
    "line-width"?: number;
    "line-color"?: string;
    "fill-outline-color"?: string;
    "fill-color"?: string | any[];
    "text-color"?: string;
  };
  layout?: {
    "symbol-placement"?: string;
    "text-size"?: number;
    "text-font"?: string[];
    "text-field"?: string[];
    "text-allow-overlap"?: boolean;
    "icon-padding"?: number;
  };
}

export function getStyle(name: string): Style {
  switch (name) {
    case "Well":
      return {
        type: "line",
        order: 0,
        paint: {
          "line-width": 3,
          "line-color": "#555",
        },
      };
    case "WellFill":
      return {
        type: "fill",
        order: 0,
        paint: {
          "fill-color": "#ccc",
        },
      };
    case "MultiConduit":
      return {
        type: "fill",
        order: 1,
        paint: {
          "fill-outline-color": "#555",
          "fill-color": [
            "match",
            ["get", "type"],
            "MultiConduitOrange",
            colorMap.LIGHT_ORANGE,
            "MultiConduitRed",
            colorMap.LIGHT_RED,
            "#ccc",
          ],
        },
      };
    case "InnerConduit":
      return {
        type: "fill",
        order: 2,
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
            "InnerConduitGrey",
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
            "#ccc",
          ],
        },
      };
    case "CableInsideWell":
      return {
        type: "line",
        order: 3,
        paint: {
          "line-width": 2,
          "line-color": "#000",
        },
      };
    case "CableOutsideWell":
      return {
        type: "line",
        order: 3,
        paint: {
          "line-width": 2,
          "line-color": "#000",
        },
      };
    case "CableOutsideWellLabel":
      return {
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
      };
    case "CableInsideWellLabel":
      return {
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
      };
    case "LabelMediumText":
      return {
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
      };
    default:
      return {
        type: "line",
        paint: {
          "line-width": 3,
          "line-color": "#000",
        },
      };
  }
}

export const schematicDiagramLayers = {
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
