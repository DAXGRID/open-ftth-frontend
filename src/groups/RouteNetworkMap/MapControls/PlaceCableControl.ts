import { Map } from "maplibre-gl";
import "./PlaceCableControl.scss";

const placeCableSvgIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5 14.5H14.5M12.5 12.5V16.5M6.5 19.5H18.5M6.5 5.5H18.5V9.5H6.5V5.5Z" stroke="#121923" stroke-width="1.2" stroke-linecap="square"/>
</svg>
`;

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

    const buttonIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    buttonIcon.innerHTML = placeCableSvgIcon;

    const button = document.createElement("button");
    button.appendChild(buttonIcon);
    button.className = "place-cable-control-button";

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
