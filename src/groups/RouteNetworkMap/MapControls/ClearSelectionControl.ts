import { Map } from "maplibre-gl";
import "./ClearSelectionControl.scss";

const clearSelectionSvgIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 4H4V7" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 12H12H16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 11V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11 4H13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11 20H13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 11V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 4H20V7" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7 20H4V17" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17 20H20V17" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

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
