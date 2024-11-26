import {
  Map,
  MapMouseEvent,
  MapGeoJSONFeature,
  Popup,
  PointLike,
} from "maplibre-gl";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "./InformationControl.scss";
import { GeoJsonProperties, Feature, Geometry } from "geojson";

library.add(faInfoCircle);

interface InformationControlLayer {
  layer: string;
  styleLayerName: string | null;
  body: string;
  filter: {
    property: string;
    value: string;
  } | null;
}

interface InformationControlConfig {
  sourceLayers: InformationControlLayer[];
}

function resolve(path: string, obj: any) {
  return path.split(".").reduce(function (prev, curr) {
    return prev ? prev[curr] : null;
  }, obj);
}

function parseBody(htmlBody: string, obj: any): string {
  const re = /({.*?})/g;

  const matches = [...htmlBody.matchAll(re)];

  if (!matches) {
    return htmlBody;
  }

  let result = htmlBody;

  for (let i = 0; i < matches.length; i++) {
    result = result.replace(
      matches[i][0],
      resolve(matches[i][0].replaceAll("{", "").replaceAll("}", ""), obj) ?? "",
    );
  }

  return result;
}

function createButton(): HTMLButtonElement {
  const buttonIcon = icon({ prefix: "fas", iconName: "info-circle" }).node[0];
  const button = document.createElement("button");
  button.appendChild(buttonIcon);
  button.className = "information-control-button";
  return button;
}

function createPopupContainer(bodyContents: string[]): string {
  const stringToHTML = (str: string) => {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, "text/html");
    return doc.body;
  };

  const body = document.createElement("div");
  body.classList.add("information-control-body");
  for (const bodyContent of bodyContents) {
    const bodyItem = document.createElement("div");
    bodyItem.classList.add("information-control-body-item");
    bodyItem.appendChild(stringToHTML(bodyContent));
    body.appendChild(bodyItem);
  }

  const container = document.createElement("div");
  container.classList.add("information-control-container");
  container.appendChild(body);

  return container.outerHTML;
}

function filterFeatures(
  config: InformationControlConfig,
  feature: MapGeoJSONFeature,
): boolean {
  const sourceLayers = config.sourceLayers.filter(
    (z) => z.layer === feature.sourceLayer,
  );

  for (let i = 0; i < sourceLayers.length; i++) {
    const sourceLayer = sourceLayers[i];

    if (sourceLayer.filter) {
      if (
        resolve(sourceLayer.filter.property, feature) ===
        sourceLayer.filter.value
      ) {
        if (sourceLayer.styleLayerName) {
          if (sourceLayer.styleLayerName === feature.layer.id) {
            return true;
          }
        } else {
          return true;
        }
      }
    } else {
      // If it has no filter we just return true since it will always match.
      return true;
    }
  }

  // No source layer is found, we just return false.
  return false;
}

function queryFeature(
  map: Map,
  config: InformationControlConfig,
  bbox: [PointLike, PointLike],
  filter: (
    config: InformationControlConfig,
    feature: MapGeoJSONFeature,
  ) => boolean,
) {
  return map.queryRenderedFeatures(bbox, {}).find((x) => {
    return filter(config, x);
  });
}

function queryFeatures(
  map: Map,
  config: InformationControlConfig,
  bbox: [PointLike, PointLike],
  filter: (
    config: InformationControlConfig,
    feature: MapGeoJSONFeature,
  ) => boolean,
) {
  return map.queryRenderedFeatures(bbox, {}).filter((x) => filter(config, x));
}

function createOnClickFunc(
  map: Map,
  config: InformationControlConfig,
  bboxSize: number,
  previousSelectedFeature: MapGeoJSONFeature[],
) {
  const onClick = (e: MapMouseEvent) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    const features = queryFeatures(map, config, bbox, filterFeatures);

    removeSelection(map, previousSelectedFeature);
    previousSelectedFeature.length = 0;
    for (let i = 0; i < features.length; i++) {
      previousSelectedFeature.push(features[i]);
    }

    // In case we don't find a feature we return since we odn't want to create a popup.
    if (features.length === 0) return;

    // We have to cast to any because of coordinates missing from type spec.
    let coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    if (features[0].geometry.type === "Point") {
      coordinates = (features[0].geometry as any).coordinates;
    }

    if (!coordinates) throw Error("Could not find BBOX for feature.");

    const parsedBodies = features.map((feature) => {
      const sourceLayers = config.sourceLayers.filter(
        (x) => x.layer === feature.sourceLayer,
      );

      if (sourceLayers.length === 1) {
        return parseBody(sourceLayers[0].body, feature);
      } else if (sourceLayers.length > 1) {
        for (let i = 0; i < sourceLayers.length; i++) {
          const sourceLayer = sourceLayers[i];
          if (
            sourceLayer.filter &&
            resolve(sourceLayer.filter?.property, feature) ===
              sourceLayer.filter?.value &&
            (!sourceLayer.styleLayerName ||
              sourceLayer.styleLayerName === feature.layer.id)
          ) {
            return parseBody(sourceLayer.body, feature);
          }
        }
        // Multiple of same layers
      } else {
        throw Error(
          `Could not find source layer for feature with ${feature.sourceLayer}`,
        );
      }

      throw Error(`Could not handle parsing bodies for ${feature}`);
    });

    if (parsedBodies) {
      showSelection(map, features);
      const popupContainer = createPopupContainer(parsedBodies);
      addPopup(map, coordinates, popupContainer);
    } else {
      throw Error("Could not parse bodies for information control display.");
    }
  };

  return onClick;
}

function createHoverPointerFunc(
  map: Map,
  config: InformationControlConfig,
  bboxSize: number,
) {
  const onHoverPointer = (e: MapMouseEvent) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    const feature = queryFeature(map, config, bbox, filterFeatures);

    if (feature) {
      map.getCanvas().style.cursor = "pointer";
    } else {
      map.getCanvas().style.cursor = "";
    }
  };

  return onHoverPointer;
}

function addPopup(map: Map, coordinates: [number, number], htmlBody: string) {
  new Popup().setLngLat(coordinates).setHTML(htmlBody).addTo(map);
}

function removePopup() {
  const popup = document.getElementsByClassName("maplibregl-popup");
  if (popup.length) {
    popup[0].remove();
  }
}

function showSelection(map: Map, features: MapGeoJSONFeature[]) {
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    map.setFeatureState(
      {
        source: feature.source,
        sourceLayer: feature.sourceLayer,
        id: feature.id,
      },
      {
        info_selection: true,
      },
    );
  }
}

function removeSelection(map: Map, features: MapGeoJSONFeature[]) {
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    map.setFeatureState(
      {
        source: feature.source,
        sourceLayer: feature.sourceLayer,
        id: feature.id,
      },
      {
        info_selection: false,
      },
    );
  }
}

// ```typescript
// (method) Map.off<"click">(type: "click", layer: string, listener: (ev: MapMouseEvent & {
//     features?: Feature<Geometry, GeoJsonProperties>[] | undefined;
// } & Object) => void): Map (+2 overloads)

class InformationControl {
  map: Map | null = null;
  container: HTMLElement | null = null;
  active: boolean = false;
  onClickFunc:
    | ((
      e: MapMouseEvent & { features?: Feature<Geometry, GeoJsonProperties>[] | undefined; } & Object,
      ) => void)
    | null = null;
  onHoverFunc: ((e: MapMouseEvent) => void) | null = null;
  config: InformationControlConfig;
  previousSelectedFeatures: MapGeoJSONFeature[];

  constructor(config: InformationControlConfig) {
    this.config = config;
    this.previousSelectedFeatures = [];
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    const button = createButton();

    this.onClickFunc = createOnClickFunc(
      map,
      this.config,
      6,
      this.previousSelectedFeatures,
    );
    this.onHoverFunc = createHoverPointerFunc(map, this.config, 6);

    button.addEventListener("click", () => {
      this.active = !this.active;
      if (!this.onClickFunc || !this.onHoverFunc) {
        throw Error("Functions are not binded.");
      }

      if (this.active) {
        button.classList.add("active");
        map.on("click", this.onClickFunc);
        map.on("mousemove", this.onHoverFunc);
      } else {
        button.classList.remove("active");
        map.off("click", this.onClickFunc);
        map.off("mousemove", this.onHoverFunc);
        removePopup();
        removeSelection(map, this.previousSelectedFeatures);
        this.previousSelectedFeatures.length = 0;
      }
    });

    this.container.appendChild(button);
    return this.container;
  }

  onRemove() {
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.onClickFunc && this.map) {
      this.map.off("click", "housenumber", this.onClickFunc);
    }
    this.map = null;
  }
}

export default InformationControl;
