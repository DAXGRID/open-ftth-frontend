import { Map } from "maplibre-gl";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";

library.add(faDownload);

function getDataURL(canvas: HTMLCanvasElement, type: string) {
  return canvas.toDataURL(type);
}

function saveFile(strData: string, fileType: string, fileName = "name") {
  let saveLink = document.createElement("a");
  saveLink.download = fileName + "." + fileType;
  saveLink.href = strData;
  saveLink.click();
}

class SaveImgControl {
  map: Map | null = null;
  container: HTMLElement | null = null;

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

    const buttonIcon = icon({
      prefix: "fas",
      iconName: faDownload.iconName,
    }).node[0];
    const button = document.createElement("button");
    button.appendChild(buttonIcon);
    button.className = "toggle-layer-button";

    button.addEventListener("click", () => {
      if (!this.map) throw Error("Could not find map.");
      const canvas = this.map.getCanvas();
      const strData = getDataURL(canvas, "png");
      saveFile(strData, "png", uuidv4());
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

export default SaveImgControl;
