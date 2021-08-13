import { Map, MapMouseEvent, GeoJSONSource } from "maplibre-gl";
import {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
  Feature,
  Point,
} from "geojson";
import { icon, library } from "@fortawesome/fontawesome-svg-core";
import { faRuler } from "@fortawesome/free-solid-svg-icons";
import { length } from "@turf/turf";
import "./MeasureDistanceControl.scss";

library.add(faRuler);

class MeasureDistanceControl {
  className: string;
  active: boolean;
  container: HTMLElement | null;
  map: Map | undefined;
  geojson: FeatureCollection<Geometry, GeoJsonProperties>;
  measureClick: (e: MapMouseEvent) => void;
  mouseMove: (e: MapMouseEvent) => void;
  distanceText: string;

  constructor(distanceText: string) {
    this.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this.container = null;
    this.active = false;
    this.geojson = {
      type: "FeatureCollection",
      features: [],
    };
    this.measureClick = () => {};
    this.mouseMove = () => {};
    this.distanceText = distanceText;
  }

  onAdd(map: Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.className = this.className;

    const buttonIcon = icon({ prefix: "fas", iconName: "ruler" }).node[0];
    const button = document.createElement("button");
    button.appendChild(buttonIcon);
    button.className = "measure-distance-control";
    button.addEventListener("click", () => {
      this.measureDistance();
    });

    this.container.appendChild(button);

    return this.container;
  }

  onRemove() {
    if (!this.container || !this.map) return;

    this.container?.parentNode?.removeChild(this.container);
    this.map = undefined;
  }

  measureDistance() {
    if (!this.map || !this.container) return;

    if (!this.active) {
      this.active = true;
      this.container.firstElementChild?.classList.add("active");

      this.mouseMove = (e: MapMouseEvent) => {
        if (!this.map) return;

        var features = this.map.queryRenderedFeatures(e.point, {
          layers: ["measure-points"],
        });

        this.map.getCanvas().style.cursor = features.length
          ? "pointer"
          : "crosshair";
      };

      this.measureClick = (e: MapMouseEvent) => {
        if (!this.map) return;

        const linestring: any = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        };

        if (this.geojson.features.length > 1) this.geojson.features.pop();

        const point: Feature<Point, GeoJsonProperties> = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [e.lngLat.lng, e.lngLat.lat],
          },
          properties: {
            id: String(new Date().getTime()),
          },
        };

        this.geojson.features.push(point);

        const distanceContainer = document.getElementById("distance");
        if (!distanceContainer)
          throw new Error("Distancecontainer could not be found");
        distanceContainer.innerHTML = "";

        if (this.geojson.features.length > 1) {
          linestring.geometry.coordinates = this.geojson.features.map(
            (point) => {
              return (point as Feature<Point, GeoJsonProperties>).geometry
                .coordinates;
            }
          );

          this.geojson.features.push(linestring);

          const value = document.createElement("pre");
          value.textContent = `${this.distanceText}: ${length(
            linestring
          ).toLocaleString()} km`;
          distanceContainer?.appendChild(value);
        }

        (this.map.getSource("measurement") as GeoJSONSource).setData(
          this.geojson
        );
      };

      this.map.on("click", this.measureClick);
      this.map.on("mousemove", this.mouseMove);
    } else {
      this.active = false;
      this.container.firstElementChild?.classList.remove("active");
      this.geojson = {
        type: "FeatureCollection",
        features: [],
      };
      (this.map.getSource("measurement") as GeoJSONSource).setData(
        this.geojson
      );

      this.map.off("click", this.measureClick);
      this.map.off("mousemove", this.mouseMove);

      const distanceContainer = document.getElementById("distance");
      if (!distanceContainer)
        throw new Error("Distancecontainer could not be found");
      distanceContainer.innerHTML = "";
    }
  }
}

export default MeasureDistanceControl;
