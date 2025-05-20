import { Map } from "maplibre-gl";
import "./PlaceCableControl.scss";

const placeCableSvgIcon = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg viewBox="0 0 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -480.000000)" fill="#000000">
            <g id="icons" transform="translate(56.000000, 160.000000)">
                <path d="M214.55,326 L212.45,326 L212.45,329 L209.3,329 L209.3,331 L212.45,331 L212.45,334 L214.55,334 L214.55,331 L217.7,331 L217.7,329 L214.55,329 L214.55,326 Z M221.9,334 L224,334 L224,326 L221.9,326 L221.9,334 Z M221.9,338 L219.8,338 L219.8,340 L224,340 L224,336 L221.9,336 L221.9,338 Z M219.8,320 L219.8,322 L221.9,322 L221.9,324 L224,324 L224,320 L219.8,320 Z M203,334 L205.1,334 L205.1,326 L203,326 L203,334 Z M205.1,336 L203,336 L203,340 L207.2,340 L207.2,338 L205.1,338 L205.1,336 Z M203,320 L203,324 L205.1,324 L205.1,322 L207.2,322 L207.2,320 L203,320 Z M209.3,340 L217.7,340 L217.7,338 L209.3,338 L209.3,340 Z M209.3,322 L217.7,322 L217.7,320 L209.3,320 L209.3,322 Z" id="plus-[#1455]">

</path>
            </g>
        </g>
    </g>
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
