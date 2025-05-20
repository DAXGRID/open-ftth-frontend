import {
  Map,
  MapMouseEvent,
  PointLike,
  LegacyFilterSpecification,
  MapGeoJSONFeature,
} from "maplibre-gl";
import "./SelectControl.scss";

const selectSvgIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 viewBox="0 0 24 24" xml:space="preserve">
<g id="select">
	<path d="M14.8,24l-3.3-4.3l-3.2,4.2L5.8,6.9l16,7.2L16.4,16l3.2,4.3L14.8,24z M11.6,16.4l3.6,4.8l1.6-1.3L13.1,15l3.3-1.1l-8.1-3.6
		l1.3,8.7L11.6,16.4z"/>
	<path d="M4,18H0v-4h2v2h2V18z M2,12H0V6h2V12z M18,10h-2V6h2V10z M18,4h-2V2h-2V0h4V4z M2,4H0V0h4v2H2V4z M12,2H6V0h6V2z"/>
</g>
</svg>
`;

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
  toggleCallback: (selectState: boolean) => void;

  constructor(
    selectionCallback: (selection: MapGeoJSONFeature) => void,
    undoCallback: () => void,
    toggleCallback: (selectState: boolean) => void,
  ) {
    this.selectionCallback = selectionCallback;
    this.undoCallback = undoCallback;
    this.toggleCallback = toggleCallback;
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this.active = false;

    const buttonIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    buttonIcon.innerHTML = selectSvgIcon;

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
        this.toggleCallback(true);
      } else {
        this.active = false;
        this.toggleCallback(false);

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
