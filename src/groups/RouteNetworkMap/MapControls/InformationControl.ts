import { Map, MapMouseEvent, MapboxGeoJSONFeature, Popup } from "maplibre-gl";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "./InformationControl.scss";

library.add(faInfoCircle);

function createButton(): HTMLButtonElement {
  const buttonIcon = icon({ prefix: "fas", iconName: "info-circle" }).node[0];
  const button = document.createElement("button");
  button.appendChild(buttonIcon);
  button.className = "information-control-button";
  return button;
}

function createOnClickFunc(map: Map) {
  const onClick = (
    e: MapMouseEvent & { features?: MapboxGeoJSONFeature[] | undefined }
  ) => {
    if (!e?.features || e?.features?.length === 0) return;

    // We have to cast to any because of coordinates missing from type spec.
    const coordinates: [number, number] = (e.features[0].geometry as any)
      .coordinates;

    if (!coordinates) throw Error("Could not find BBOX for feature.");

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    addPopup(map, coordinates);
  };

  return onClick;
}

function addPopup(map: Map, coordinates: [number, number]) {
  new Popup().setLngLat(coordinates).setHTML("Hello world!").addTo(map);
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

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    const button = createButton();
    this.onClickFunc = createOnClickFunc(map);
    button.addEventListener("click", () => {
      this.active = !this.active;
      if (!this.onClickFunc) {
        throw Error("Function is not binded.");
      }
      if (this.active) {
        button.classList.add("active");
        map.on("click", "housenumber", this.onClickFunc);
      } else {
        button.classList.remove("active");
        map.off("click", "housenumber", this.onClickFunc);
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
