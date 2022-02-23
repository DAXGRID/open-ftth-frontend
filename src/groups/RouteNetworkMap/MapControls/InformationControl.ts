import {
  Map,
  MapMouseEvent,
  MapboxGeoJSONFeature,
  Popup,
  PointLike,
} from "maplibre-gl";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "./InformationControl.scss";

library.add(faInfoCircle);

interface InformationControlLayer {
  layer: string;
  body: string;
}

interface InformationControlConfig {
  sourceLayers: InformationControlLayer[];
}

const controlConfig: InformationControlConfig = {
  sourceLayers: [
    {
      layer: "housenumber",
      body: '<a href="http://dr.dk?housenumber={properties.housenumber}">This is my house number! {properties.housenumber} and this is the x coordinate: {geometry.coordinates.0} and this is the y coordinate {geometry.coordinates.1}</a>',
    },
  ],
};

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

    const feature = map
      .queryRenderedFeatures(bbox, {})
      .find((x) =>
        config.sourceLayers.map((x) => x.layer).includes(x.sourceLayer, 0)
      );

    if (!feature) return;

    // We have to cast to any because of coordinates missing from type spec.
    const coordinates: [number, number] = (feature.geometry as any).coordinates;

    if (!coordinates) throw Error("Could not find BBOX for feature.");

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const htmlBody = config.sourceLayers.find(
      (x) => x.layer === feature.sourceLayer
    )?.body;

    if (!htmlBody) {
      throw Error(
        `Could not find htmlBody for feature using sourceLayer: ${feature.sourceLayer}`
      );
    }

    const parsedBody = parseBody(htmlBody, feature);

    addPopup(map, coordinates, parsedBody);
  };

  return onClick;
}

function createHoverPointerFunc(
  map: Map,
  featureNames: string[],
  bboxSize: number
) {
  const onHoverPointer = (e: MapMouseEvent) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    const features = map
      .queryRenderedFeatures(bbox, {})
      .filter((x) => featureNames.includes(x.sourceLayer, 0));

    if (features.length > 0) {
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

class InformationControl {
  map: Map | null = null;
  container: HTMLElement | null = null;
  active: boolean = false;
  onClickFunc:
    | ((
        e: MapMouseEvent & { features?: MapboxGeoJSONFeature[] | undefined }
      ) => void)
    | null = null;
  onHoverFunc: ((e: MapMouseEvent) => void) | null = null;

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    const button = createButton();

    this.onClickFunc = createOnClickFunc(map, controlConfig, 4);
    this.onHoverFunc = createHoverPointerFunc(map, ["housenumber"], 4);

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
