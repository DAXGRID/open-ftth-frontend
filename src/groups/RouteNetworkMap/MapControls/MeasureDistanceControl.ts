import { Map, MapMouseEvent, GeoJSONSource } from "maplibre-gl";
import {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
  Feature,
  Point,
  LineString,
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
  measurementFeatures: FeatureCollection<Geometry, GeoJsonProperties>;
  measureClick: (e: MapMouseEvent) => void;
  mouseMove: (e: MapMouseEvent) => void;
  disableContextMenu: (e: MapMouseEvent) => void;
  leftClickDisabled: boolean;
  totalLenghtText: string;
  lengthText: string;

  constructor(lengthText: string, totalLenghtText: string) {
    this.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this.container = null;
    this.active = false;
    this.measurementFeatures = {
      type: "FeatureCollection",
      features: [],
    };
    this.measureClick = () => {};
    this.mouseMove = () => {};
    this.disableContextMenu = (e) => {
      e.preventDefault();
    };
    this.totalLenghtText = totalLenghtText;
    this.lengthText = lengthText;
    this.leftClickDisabled = false;
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

    const distanceContainer = document.getElementById("distance");
    if (!distanceContainer)
      throw new Error("Distancecontainer could not be found");

    const value = document.createElement("pre");
    value.textContent = "";
    distanceContainer.appendChild(value);

    if (!this.active) {
      this.active = true;
      this.container.firstElementChild?.classList.add("active");

      this.mouseMove = (e: MapMouseEvent) => {
        if (!this.map) return;

        this.map.getCanvas().style.cursor = "Pointer";

        const linestring: Feature<LineString, GeoJsonProperties> = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
          properties: {},
        };

        if (this.measurementFeatures.features.length > 1) {
          this.measurementFeatures.features.pop();
          this.measurementFeatures.features.pop();
        }

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

        this.measurementFeatures.features.push(point);

        if (this.measurementFeatures.features.length >= 1) {
          // This is created because customers asked to showcase the length of the newest linestring
          // from the lastest point.
          const lastLinestring: Feature<LineString, GeoJsonProperties> = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: this.measurementFeatures.features
                .filter((x) => x.geometry.type === "Point")
                .slice(-2)
                .map(
                  (point) =>
                    (point as Feature<Point, GeoJsonProperties>).geometry
                      .coordinates,
                ),
            },
            properties: {},
          };

          linestring.geometry.coordinates = [
            ...this.measurementFeatures.features,
            point,
          ].map((point) => {
            return (point as Feature<Point, GeoJsonProperties>).geometry
              .coordinates;
          });

          this.measurementFeatures.features.push(linestring);

          const latestLength = `${this.lengthText}: ${length(lastLinestring, {
            units: "meters",
          }).toLocaleString()} m`;

          const totalLengthText = `${this.totalLenghtText}: ${length(
            linestring,
            {
              units: "meters",
            },
          ).toLocaleString()} m`;

          value.textContent = latestLength + "\n" + totalLengthText;
        }

        (this.map.getSource("measurement") as GeoJSONSource).setData(
          this.measurementFeatures,
        );
      };

      this.measureClick = (e: MapMouseEvent) => {
        if (!this.map) return;

        if (e.originalEvent.button === 2) {
          // When right click is clicked again we reset the state.
          if (this.leftClickDisabled) {
            this.measurementFeatures = {
              type: "FeatureCollection",
              features: [],
            };
            (this.map.getSource("measurement") as GeoJSONSource).setData(
              this.measurementFeatures,
            );
            this.map.on("mousemove", this.mouseMove);
            this.leftClickDisabled = false;
          } else {
            // In case of right click we disable the measurement features.

            // We remove the last two elements since they have not been selected by the user yet.
            this.measurementFeatures.features.pop();
            this.measurementFeatures.features.pop();

            const linestring: Feature<LineString, GeoJsonProperties> = {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [],
              },
              properties: {},
            };

            if (this.measurementFeatures.features.length > 1) {
              // After the two last elements has been removed,
              // we only want to draw if there are more than 1 points in the collection.
              linestring.geometry.coordinates =
                this.measurementFeatures.features.map((point) => {
                  return (point as Feature<Point, GeoJsonProperties>).geometry
                    .coordinates;
                });

              this.measurementFeatures.features.push(linestring);
            }

            const lastLinestring: Feature<LineString, GeoJsonProperties> = {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: this.measurementFeatures.features
                  .filter((x) => x.geometry.type === "Point")
                  .slice(-2)
                  .map(
                    (point) =>
                      (point as Feature<Point, GeoJsonProperties>).geometry
                        .coordinates,
                  ),
              },
              properties: {},
            };

            const latestLength = `${this.lengthText}: ${length(lastLinestring, {
              units: "meters",
            }).toLocaleString()} m`;

            const totalLengthText = `${this.totalLenghtText}: ${length(
              linestring,
              {
                units: "meters",
              },
            ).toLocaleString()} m`;

            value.textContent = latestLength + "\n" + totalLengthText;

            (this.map.getSource("measurement") as GeoJSONSource).setData(
              this.measurementFeatures,
            );
            this.map.off("mousemove", this.mouseMove);
            this.map.getCanvas().style.cursor = "";
            this.leftClickDisabled = true;
          }

          return;
        }

        // If the measurement has been left click disabled, we do nothing
        // until the state has been reset.
        if (this.leftClickDisabled) {
          return;
        }

        const linestring: Feature<LineString, GeoJsonProperties> = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
          properties: {},
        };

        if (this.measurementFeatures.features.length > 1)
          this.measurementFeatures.features.pop();

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

        this.measurementFeatures.features.push(point);

        if (this.measurementFeatures.features.length > 1) {
          linestring.geometry.coordinates =
            this.measurementFeatures.features.map((point) => {
              return (point as Feature<Point, GeoJsonProperties>).geometry
                .coordinates;
            });

          this.measurementFeatures.features.push(linestring);

          const lastLinestring: Feature<LineString, GeoJsonProperties> = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: this.measurementFeatures.features
                .filter((x) => x.geometry.type === "Point")
                .slice(-2)
                .map(
                  (point) =>
                    (point as Feature<Point, GeoJsonProperties>).geometry
                      .coordinates,
                ),
            },
            properties: {},
          };

          const latestLength = `${this.lengthText}: ${length(lastLinestring, {
            units: "meters",
          }).toLocaleString()} m`;

          const totalLengthText = `${this.totalLenghtText}: ${length(
            linestring,
            {
              units: "meters",
            },
          ).toLocaleString()} m`;

          value.textContent = latestLength + "\n" + totalLengthText;
        }

        (this.map.getSource("measurement") as GeoJSONSource).setData(
          this.measurementFeatures,
        );
      };

      this.map.on("mousedown", this.measureClick);
      this.map.on("mousemove", this.mouseMove);
      this.map.on("contextmenu", () => this.disableContextMenu);
    } else {
      this.active = false;
      this.container.firstElementChild?.classList.remove("active");
      this.measurementFeatures = {
        type: "FeatureCollection",
        features: [],
      };
      (this.map.getSource("measurement") as GeoJSONSource).setData(
        this.measurementFeatures,
      );

      this.map.off("mousedown", this.measureClick);
      this.map.off("mousemove", this.mouseMove);
      this.map.off("contextmenu", () => this.disableContextMenu);
      this.map.getCanvas().style.cursor = "";
      this.leftClickDisabled = false;

      distanceContainer.innerHTML = "";
    }
  }
}

export default MeasureDistanceControl;
