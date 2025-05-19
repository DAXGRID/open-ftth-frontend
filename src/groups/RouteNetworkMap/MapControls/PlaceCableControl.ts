import { Map } from "maplibre-gl";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import "./ToggleLayerButton.scss";

library.add(faPlayCircle);

class PlaceCableControl {
  map: Map | null = null;
  container: HTMLElement | null = null;
  callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    const buttonIcon = icon({ prefix: "fas", iconName: faPlayCircle.iconName })
      .node[0];

    const button = document.createElement("button");
    button.appendChild(buttonIcon);
    button.className = "place-cable-control";

    button.addEventListener("click", () => {
      this.callback();
    });

    this.container.appendChild(button);

    return this.container;
  }

  onRemove() {
    if (!this.container || !this.map) return;
    this.container?.parentNode?.removeChild(this.container);
    this.map = null;
  }
}

export default PlaceCableControl;
