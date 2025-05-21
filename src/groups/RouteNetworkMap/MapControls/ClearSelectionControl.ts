import { Map } from "maplibre-gl";
import "./ClearSelectionControl.scss";

const clearSelectionSvgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 20C21 20.55 20.55 21 20 21H19V19H21V20M15 21V19H17V21H15M11 21V19H13V21H11M7 21V19H9V21H7M4 21C3.45 21 3 20.55 3 20V19H5V21H4M3 15H5V17H3V15M21 15V17H19V15H21M14.59 8L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41L14.59 8M3 11H5V13H3V11M21 11V13H19V11H21M3 7H5V9H3V7M21 7V9H19V7H21M4 3H5V5H3V4C3 3.45 3.45 3 4 3M20 3C20.55 3 21 3.45 21 4V5H19V3H20M15 5V3H17V5H15M11 5V3H13V5H11M7 5V3H9V5H7Z" /></svg>`;

class ClearSelectionControl {
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
    buttonIcon.innerHTML = clearSelectionSvgIcon;

    const button = document.createElement("button");
    button.appendChild(buttonIcon);
    button.className = "clear-selection-control-button";

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

export default ClearSelectionControl;
