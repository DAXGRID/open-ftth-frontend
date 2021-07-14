import { Map } from "mapbox-gl";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

library.add(faArrowRight, faArrowLeft);

class ToggleDiagramControl {
  className: string;
  container: HTMLElement | null;
  map: Map | undefined;
  toggleDiagram: (show: boolean) => void;
  show: boolean;

  constructor(toggleDiagram: (show: boolean) => void) {
    this.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this.container = null;
    this.toggleDiagram = toggleDiagram;
    this.show = true;
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = this.className;

    const createButtonIcon = (show: boolean): Element => {
      const iconToShow = show ? "arrow-right" : "arrow-left";
      return icon({ prefix: "fas", iconName: iconToShow }).node[0];
    };

    const button = document.createElement("button");
    button.appendChild(createButtonIcon(this.show));
    button.className = "toggle-layer-button";
    button.addEventListener("click", () => {
      this.show = !this.show;
      this.toggleDiagram(this.show);
      button.firstChild?.remove();
      button.appendChild(createButtonIcon(this.show));
    });

    this.container.appendChild(button);

    return this.container;
  }

  onRemove() {
    if (!this.container || !this.map) return;
    this.container?.parentNode?.removeChild(this.container);
    this.map = undefined;
  }
}

export default ToggleDiagramControl;
