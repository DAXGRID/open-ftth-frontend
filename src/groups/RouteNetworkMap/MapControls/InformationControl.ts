import {
  Map,
  MapMouseEvent,
  MapGeoJSONFeature,
  Popup,
  PointLike,
  GeoJSONSource,
} from "maplibre-gl";
import { Geometry, GeoJsonProperties, Feature } from "geojson";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "./InformationControl.scss";

library.add(faInfoCircle);

interface InformationControlLayer {
  layer: string;
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
      resolve(matches[i][0].replaceAll("{", "").replaceAll("}", ""), obj)
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
  feature: MapGeoJSONFeature
): boolean {
  const sourceLayer = config.sourceLayers.find(
    (z) => z.layer === feature.sourceLayer
  );

  if (sourceLayer) {
    // If it is we check to see if the sourceLayer feature found matches the filter (either true or false).
    // If there is no filter, we return that the feature is found (true).
    return sourceLayer.filter
      ? !!feature.properties &&
          resolve(sourceLayer.filter.property, feature) ===
            sourceLayer.filter.value
      : true;
  } else {
    // If we cannot find the feature on source layer we just return false.
    return false;
  }
}

function queryFeature(
  map: Map,
  config: InformationControlConfig,
  bbox: [PointLike, PointLike],
  filter: (
    config: InformationControlConfig,
    feature: MapGeoJSONFeature
  ) => boolean
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
    feature: MapGeoJSONFeature
  ) => boolean
) {
  return map
    .queryRenderedFeatures(bbox, {})
    .filter((x) => filter(config, x))
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
}

function createOnClickFunc(
  map: Map,
  config: InformationControlConfig,
  bboxSize: number
) {
  const onClick = (e: MapMouseEvent) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    const features = queryFeatures(map, config, bbox, filterFeatures);

    // In case we don't find a feature we return since we odn't want to create a popup.
    if (features.length === 0) return;

    // We have to cast to any because of coordinates missing from type spec.
    const coordinates: [number, number] = (features[0].geometry as any)
      .coordinates;

    if (!coordinates) throw Error("Could not find BBOX for feature.");

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const parsedBodies = features.map((feature) => {
      const sourceLayer = config.sourceLayers.find(
        (x) => x.layer === feature.sourceLayer
      );

      if (!sourceLayer) {
        throw Error(
          `Could not find source layer for feature with ${feature.sourceLayer}`
        );
      }

      return parseBody(sourceLayer.body, feature);
    });

    showSelection(map, features[0]);

    const popupContainer = createPopupContainer(parsedBodies);
    addPopup(map, coordinates, popupContainer);
  };

  return onClick;
}

function createHoverPointerFunc(
  map: Map,
  config: InformationControlConfig,
  bboxSize: number
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
  const popup = document.getElementsByClassName("mapboxgl-popup");
  if (popup.length) {
    popup[0].remove();
  }
}

function showSelection(map: Map, myFeature: any) {
  const features: Feature<Geometry, GeoJsonProperties>[] = [];
  const feature: Feature<Geometry, GeoJsonProperties> = {
    id: 0,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        myFeature.geometry.coordinates[0],
        myFeature.geometry.coordinates[1],
      ],
    },
    properties: {},
  };

  features.push(feature);

  (map.getSource("information_marker") as GeoJSONSource)?.setData({
    type: "FeatureCollection",
    features: features ?? [],
  });
}

function removeSelection(map: Map) {
  (map.getSource("information_marker") as GeoJSONSource)?.setData({
    type: "FeatureCollection",
    features: [],
  });
}

class InformationControl {
  map: Map | null = null;
  container: HTMLElement | null = null;
  active: boolean = false;
  onClickFunc:
    | ((
        e: MapMouseEvent & { features?: MapGeoJSONFeature[] | undefined }
      ) => void)
    | null = null;
  onHoverFunc: ((e: MapMouseEvent) => void) | null = null;
  config: InformationControlConfig;

  constructor(config: InformationControlConfig) {
    this.config = config;
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    const button = createButton();

    this.onClickFunc = createOnClickFunc(map, this.config, 6);
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
        removeSelection(map);
      }
    });

    this.container.appendChild(button);
    return this.container;
  }

  onRemove() {
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.map && this.active) {
      if (this.onClickFunc) {
        this.map.off("click", this.onClickFunc);
      }
      if (this.onHoverFunc) {
        this.map.off("mousemove", this.onHoverFunc);
      }
    }

    this.map = null;
  }
}

export default InformationControl;
