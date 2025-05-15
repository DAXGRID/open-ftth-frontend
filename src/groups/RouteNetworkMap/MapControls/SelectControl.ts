import {
  Map,
  MapMouseEvent,
  PointLike,
  LegacyFilterSpecification,
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

  const featureNames = ["route_segment", "route_node"] as const;

  return map.queryRenderedFeatures(bbox, {
    filter: [
      "any",
      ...featureNames.map((x) => {
        return [
          "==",
          "objecttype",
          "route_segment",
        ] as LegacyFilterSpecification;
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

function createOnClickFunc(map: Map, bboxSize: number) {
  const onClick = (e: MapMouseEvent) => {
    const features = queryFeatures(map, bboxSize, e);
    console.log(features);
  };

  return onClick;
}

class SelectControl {
  map: Map | null = null;
  container: HTMLElement | null = null;
  active: boolean = false;

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

    button.addEventListener("click", () => {
      this.enableSelection();
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

  enableSelection() {
    if (!this.map || !this.container) return;

    const bboxSize = 4;
    const hoverFunc = createHoverPointerFunc(this.map, bboxSize);
    const clickFunc = createOnClickFunc(this.map, bboxSize);

    if (!this.active) {
      this.map.on("mousemove", hoverFunc);
      this.map.on("click", clickFunc);

      this.active = true;
      console.log("Selection has been enabled");
      this.container.firstElementChild?.classList.add("active");
    } else {
      this.active = false;

      this.map.off("mousemove", hoverFunc);
      this.map.off("click", clickFunc);

      // Set default cursor
      this.map.getCanvas().style.cursor = "";

      console.log("Selection has been disabled");
      this.container.firstElementChild?.classList.remove("active");
    }
  }
}

export default SelectControl;
