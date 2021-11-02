import { Map } from "maplibre-gl";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import "./ToggleLayerButton.scss";

library.add(faLayerGroup);

type LayerItem = {
  name: string;
  text: string;
  callback: (layerName: string) => void;
  defaultVisible: boolean;
};

type Layer = {
  name: string;
  text: string;
};

function createToggleListItem(layerItem: LayerItem): HTMLElement {
  const element = document.createElement("li");
  element.innerText = layerItem.text;
  element.setAttribute("role", "button");

  if (layerItem.defaultVisible) {
    element.classList.add("toggle-list-item", "toggle-list-item--selected");
  } else {
    element.classList.add("toggle-list-item");
  }

  element.addEventListener("click", () => {
    layerItem.callback(layerItem.name);
    if (element.classList.contains("toggle-list-item--selected")) {
      element.classList.remove("toggle-list-item--selected");
    } else {
      element.classList.add("toggle-list-item--selected");
    }
  });
  return element;
}

function createToggleList(layerItems: LayerItem[]): HTMLElement {
  const element = document.createElement("div");
  element.classList.add("toggle-list");

  const ul = document.createElement("ul");

  layerItems.forEach((x) => {
    const listItem = createToggleListItem(x);
    ul.appendChild(listItem);
  });

  element.appendChild(ul);
  return element;
}

class ToggleLayerButton {
  layers: Layer[];
  container: HTMLElement | null;
  map: Map | undefined;
  toggleButton: HTMLElement | null;
  toggleList: HTMLElement | null;

  constructor(layerNames: Layer[]) {
    this.layers = layerNames;
    this.container = null;
    this.toggleButton = null;
    this.toggleList = null;
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

    const buttonIcon = icon({ prefix: "fas", iconName: "layer-group" }).node[0];

    const button = document.createElement("button");
    button.appendChild(buttonIcon);
    button.className = "toggle-layer-button";

    button.addEventListener("click", () => {
      this.toggleVisibility();
    });

    this.container.appendChild(button);

    const layerItems = this.layers.map<LayerItem>((x) => {
      return {
        name: x.name,
        text: x.text,
        defaultVisible:
          this.map?.getLayoutProperty(x.name, "visibility") === "visible",
        callback: () => {
          if (!this.map || !this.container) return;
          var visibility = this.map.getLayoutProperty(x.name, "visibility");
          if (visibility === "visible") {
            this.map.setLayoutProperty(x.name, "visibility", "none");
          } else {
            this.map.setLayoutProperty(x.name, "visibility", "visible");
          }
        },
      };
    });

    const toggleList = createToggleList(layerItems);
    this.container.appendChild(toggleList);

    this.toggleButton = button;
    this.toggleList = toggleList;

    return this.container;
  }

  onRemove() {
    if (!this.container || !this.map) return;
    this.container?.parentNode?.removeChild(this.container);
    this.map = undefined;
  }

  toggleVisibility() {
    if (!this.map || !this.container) return;

    if (this.toggleButton?.classList.contains("active")) {
      this.container.firstElementChild?.classList.remove("active");
      this.toggleList?.classList.remove("toggle-list--visible");
    } else {
      this.container.firstElementChild?.classList.add("active");
      this.toggleList?.classList.add("toggle-list--visible");
    }
  }
}

export default ToggleLayerButton;
