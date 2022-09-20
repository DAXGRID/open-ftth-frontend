import { useTranslation } from "react-i18next";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import {
  GeoJSONSource,
  Map,
  MapboxGeoJSONFeature,
  MapMouseEvent,
  PointLike,
  Style,
  SymbolLayer,
  ScaleControl,
  AttributionControl,
  NavigationControl,
  GeolocateControl,
} from "maplibre-gl";
import { useContext, useEffect, useRef, useState } from "react";
import Config from "../../config";
import { MapContext } from "../../contexts/MapContext";
import ToggleLayerButton from "./MapControls/ToggleLayerButton";
import MeasureDistanceControl from "./MapControls/MeasureDistanceControl";
import ToggleDiagramControl from "./MapControls/ToggleDiagramControl";
import InformationControl from "./MapControls/InformationControl";
import SaveImgControl from "./MapControls/SaveImgControl";

const GetMaplibreStyle = async (): Promise<Style> => {
  const x = await fetch("./maplibre.json");
  const json = await x.json();
  return json as Style;
};

function enableResize(map: Map) {
  window.addEventListener("resize", () => {
    // Hack to handle resize of mapcanvas because
    // the event gets called to early, so we have to queue it up
    setTimeout(() => {
      map.resize();
    }, 1);
  });
}

function hoverPointer(featureNames: string[], bboxSize: number, map: Map) {
  map.on("mousemove", (e: MapMouseEvent) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    var features = map.queryRenderedFeatures(bbox, {
      filter: [
        "any",
        ...featureNames.map((x) => {
          return ["==", "objecttype", x];
        }),
      ],
    });

    if (features.length > 0) {
      map.getCanvas().style.cursor = "pointer";
    } else {
      map.getCanvas().style.cursor = "";
    }
  });
}

function clickHighlight(
  featureNames: string[],
  bboxSize: number,
  map: Map,
  lastHighlightedFeature: React.RefObject<MapboxGeoJSONFeature>,
  measureDistanceControl: MeasureDistanceControl,
  callback: (feature: MapboxGeoJSONFeature) => void
) {
  map.on("click", (e) => {
    // Do nothing if the measure distance control is active to avoid
    // annoyances for the user doing measureing.
    if (measureDistanceControl.active) return;

    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    const changeSymbolIconImageHighlight = (
      iconLayer: any,
      feature: MapboxGeoJSONFeature,
      remove: boolean
    ) => {
      // We have to do this check because mapbox is annoying and changes the type "randomly"
      let icon =
        typeof iconLayer !== "string" ? (iconLayer.name as string) : iconLayer;

      // In case that we switch from highlighted icon to another
      if (icon.endsWith("-highlight")) {
        icon = icon.replace("-highlight", "");
      }

      // This is required because we cannot use state for icons in mapbox to switch icon.
      map.setLayoutProperty(feature.layer?.id, "icon-image", [
        "match",
        ["id"],
        remove ? -1 : feature.id,
        `${icon}-highlight`,
        icon,
      ]);
    };

    // reset last state to avoid multiple selected at the same time
    if (lastHighlightedFeature.current) {
      // We have to change it to any because mapbox changes the type randomly
      const iconImage = (lastHighlightedFeature.current?.layer as SymbolLayer)
        .layout?.["icon-image"] as any;

      // If it has iconImage change highlight
      if (iconImage) {
        changeSymbolIconImageHighlight(
          iconImage,
          lastHighlightedFeature.current,
          true
        );
      }

      map.setFeatureState(lastHighlightedFeature.current, {
        ...lastHighlightedFeature.current,
        selected: false,
      });
    }

    const feature = map
      .queryRenderedFeatures(bbox)
      .find((x) => featureNames.find((y) => y === x.properties?.objecttype));

    if (!feature) {
      return;
    }

    // We have to change it to any because mapbox changes the type randomly
    const iconImage = (feature.layer as SymbolLayer).layout?.[
      "icon-image"
    ] as any;
    // If it has iconImage change highlight
    if (iconImage) {
      changeSymbolIconImageHighlight(iconImage, feature, false);
    }

    feature.state.selected = !feature.state.selected;
    map.setFeatureState(feature, {
      ...feature,
      selected: feature.state.selected,
    });

    if (callback) callback(feature);
  });
}

function highlightGeometries(map: Map, geoms: string[]) {
  const features = geoms.map<Feature<Geometry, GeoJsonProperties>>((x, i) => {
    return {
      id: i,
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: JSON.parse(x),
      },
      properties: {},
    };
  });

  (map.getSource("route_segment_trace") as GeoJSONSource)?.setData({
    type: "FeatureCollection",
    features: features ?? [],
  });
}

function mapFitBounds(
  map: Map,
  envelope: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }
) {
  map.fitBounds(
    [
      [envelope.minX, envelope.minY],
      [envelope.maxX, envelope.maxY],
    ],
    {
      animate: false,
    }
  );
}

type RouteNetworkMapProps = {
  showSchematicDiagram: (show: boolean) => void;
};

function RouteNetworkMap({ showSchematicDiagram }: RouteNetworkMapProps) {
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const lastHighlightedFeature = useRef<MapboxGeoJSONFeature | null>(null);
  const map = useRef<Map | null>(null);
  const { setIdentifiedFeature, trace, searchResult } = useContext(MapContext);
  const [mapLibreStyle, setMaplibreStyle] = useState<Style | null>(null);

  useEffect(() => {
    GetMaplibreStyle().then((r) => {
      setMaplibreStyle(r);
    });
  }, [setMaplibreStyle]);

  useEffect(() => {
    if (!map.current) return;
    if (trace.wgs84) {
      mapFitBounds(map.current, {
        minX: trace.wgs84.minX,
        minY: trace.wgs84.minY,
        maxX: trace.wgs84.maxX,
        maxY: trace.wgs84.maxY,
      });
    }
    highlightGeometries(map.current, trace.geometries);
  }, [trace, map]);

  useEffect(() => {
    if (!mapLibreStyle || !mapContainer.current) return;

    const newMap = new Map({
      container: mapContainer.current,
      style: mapLibreStyle,
      preserveDrawingBuffer: true,
      doubleClickZoom: false,
      dragRotate: false,
    });

    newMap.touchZoomRotate.disableRotation();

    newMap.addControl(new ScaleControl(), "bottom-left");

    newMap.addControl(
      new AttributionControl({
        customAttribution: [
          '<a href="http://www.openstreetmap.org/about/">© OpenStreetMap contributors</a>',
          '<a href="https://openmaptiles.org/">© OpenMapTiles</a>',
        ],
      }),
      "bottom-right"
    );

    newMap.addControl(
      new NavigationControl({
        showCompass: false,
      }),
      "top-left"
    );

    newMap.addControl(
      new ToggleDiagramControl(showSchematicDiagram),
      "top-right"
    );

    newMap.addControl(new SaveImgControl(), "top-right");

    if (
      Config.INFORMATION_CONTROL_CONFIG.sourceLayers &&
      Config.INFORMATION_CONTROL_CONFIG.sourceLayers.length > 0
    ) {
      newMap.addControl(
        new InformationControl(Config.INFORMATION_CONTROL_CONFIG),
        "top-right"
      );
    }

    newMap.addControl(
      new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: false,
        },
        trackUserLocation: true,
        showAccuracyCircle: false,
      })
    );
    const measureDistanceControl = new MeasureDistanceControl(t("DISTANCE"));
    newMap.addControl(measureDistanceControl, "top-right");

    newMap.on("load", () => {
      // We add this control here since it checks the style
      newMap.addControl(
        new ToggleLayerButton(
          Config.LAYERS.flatMap((x) => {
            return x.layerGroups;
          })
        ),
        "top-right"
      );
      enableResize(newMap);
      hoverPointer(["route_node", "route_segment"], 10, newMap);
      clickHighlight(
        ["route_segment", "route_node"],
        10,
        newMap,
        lastHighlightedFeature,
        measureDistanceControl,
        (x) => {
          let type: "RouteNode" | "RouteSegment" | null = null;
          if (x?.properties?.objecttype === "route_node") {
            type = "RouteNode";
          } else if (x?.properties?.objecttype === "route_segment") {
            type = "RouteSegment";
          } else {
            throw Error(`${x.type} is not a valid type`);
          }

          lastHighlightedFeature.current = x;
          setIdentifiedFeature({ id: x?.properties?.mrid, type: type });
        }
      );

      newMap.addSource("route_segment_trace", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      newMap.addLayer({
        id: "route_segment_trace",
        type: "line",
        source: "route_segment_trace",
        paint: {
          "line-color": "#40e0d0",
          "line-width": 4,
        },
      });

      newMap.addSource("search_marker", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      newMap.addLayer({
        id: "search_marker",
        type: "circle",
        source: "search_marker",
        paint: {
          "circle-radius": 12,
          "circle-stroke-width": 2,
          "circle-opacity": 0,
          "circle-stroke-color": "#FF0000",
        },
      });

      newMap.addSource("information_marker", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      newMap.addLayer({
        id: "information_marker",
        type: "circle",
        source: "information_marker",
        paint: {
          "circle-radius": 12,
          "circle-stroke-width": 2,
          "circle-opacity": 0,
          "circle-stroke-color": "#33b5e5",
        },
      });

      newMap.addSource("measurement", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      newMap.addLayer({
        id: "measure-points",
        type: "circle",
        source: "measurement",
        paint: {
          "circle-radius": 5,
          "circle-color": "#FFD700",
        },
        filter: ["in", "$type", "Point"],
      });

      newMap.addLayer({
        id: "measure-lines",
        type: "line",
        source: "measurement",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#FFD700",
          "line-width": 2.5,
        },
        filter: ["in", "$type", "LineString"],
      });
    });

    map.current = newMap;

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, [setIdentifiedFeature, showSchematicDiagram, t, mapLibreStyle]);

  useEffect(() => {
    if (!map.current || !searchResult) return;

    const features: Feature<Geometry, GeoJsonProperties>[] = [];
    const feature: Feature<Geometry, GeoJsonProperties> = {
      id: 0,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [searchResult.xwgs, searchResult.ywgs],
      },
      properties: {},
    };

    features.push(feature);

    (map.current.getSource("search_marker") as GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features: features ?? [],
    });

    map.current.flyTo({
      center: [searchResult.xwgs, searchResult.ywgs],
      zoom: 17,
      animate: false,
    });
  }, [searchResult]);

  return (
    <div className="route-network-map">
      <div className="route-network-map-container" ref={mapContainer}>
        <div id="distance" className="distance-container"></div>
      </div>
    </div>
  );
}

export default RouteNetworkMap;
