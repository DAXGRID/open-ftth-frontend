import {
  Map,
  MapMouseEvent,
  PointLike,
  LegacyFilterSpecification,
  MapGeoJSONFeature,
} from "maplibre-gl";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faArrowPointer } from "@fortawesome/free-solid-svg-icons";
import "./SelectControl.scss";

library.add(faArrowPointer);

function queryFeatures(map: Map, bboxSize: number, e: MapMouseEvent) {
  const bbox: [PointLike, PointLike] = [
    [e.point.x - bboxSize, e.point.y - bboxSize],
    [e.point.x + bboxSize, e.point.y + bboxSize],
  ] as const;

  const featureNames = ["route_segment"] as const;

  return map.queryRenderedFeatures(bbox, {
    filter: [
      "any",
      ...featureNames.map((x) => {
        return ["==", "objecttype", x] as LegacyFilterSpecification;
      }),
    ],
  });
}

function createHoverPointerFunc(map: Map, bboxSize: number) {
  const onHoverPointer = (e: MapMouseEvent) => {
    const features = queryFeatures(map, bboxSize, e);

    if (features.length > 0) {
      map.getCanvas().style.cursor = "pointer";
    } else {
      map.getCanvas().style.cursor = "";
    }
  };

  return onHoverPointer;
}

function createOnClickFunc(
  map: Map,
  bboxSize: number,
  selectedFeatureCallback: (x: MapGeoJSONFeature) => void,
) {
  const onClick = (e: MapMouseEvent) => {
    const features = queryFeatures(map, bboxSize, e);

    if (features.length > 0) {
      const feature = features[0];
      selectedFeatureCallback(feature);
    }
  };

  return onClick;
}

function createOnLeftClickFunc(undoCallback: () => void) {
  return (e: MapMouseEvent) => {
    if (e.originalEvent.button === 2) {
      undoCallback();
    }
  };
}

class SelectControl {
  map: Map | null = null;
  container: HTMLElement | null = null;
  active: boolean = false;
  selections: MapGeoJSONFeature[] = [];
  selectionCallback: (selection: MapGeoJSONFeature) => void;
  undoCallback: () => void;

  constructor(
    selectionCallback: (selection: MapGeoJSONFeature) => void,
    undoCallback: () => void,
  ) {
    this.selectionCallback = selectionCallback;
    this.undoCallback = undoCallback;
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this.active = false;

    const buttonIcon = icon({
      prefix: "fas",
      iconName: faArrowPointer.iconName,
    }).node[0];

    const button = document.createElement("button");
    button.appendChild(buttonIcon);
    button.className = "select-control-button";

    const bboxSize = 4;

    const hoverFunc = createHoverPointerFunc(this.map, bboxSize);

    const clickFunc = createOnClickFunc(this.map, bboxSize, (feature) => {
      this.selectionCallback(feature);
    });

    const leftClickFunc = createOnLeftClickFunc(this.undoCallback);

    button.addEventListener("click", () => {
      if (!this.map || !this.container) return;

      if (!this.active) {
        this.map.on("mousemove", hoverFunc);
        this.map.on("click", clickFunc);
        this.map.on("mousedown", leftClickFunc);

        this.active = true;
        this.container.firstElementChild?.classList.add("active");
      } else {
        this.active = false;

        this.map.off("mousemove", hoverFunc);
        this.map.off("click", clickFunc);
        this.map.off("mousedown", leftClickFunc);

        this.selections.length = 0;

        this.map.getCanvas().style.cursor = "";

        this.container.firstElementChild?.classList.remove("active");
      }
    });

    this.container.appendChild(button);
    return this.container;
  }

  onRemove() {
    this.container?.parentNode?.removeChild(this.container);
    if (this.map) {
      this.map = null;
    }
  }
}

export default SelectControl;
