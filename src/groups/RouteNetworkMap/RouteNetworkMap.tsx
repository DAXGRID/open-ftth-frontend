import { useEffect, useRef, useContext } from "react";
import { useClient } from "urql";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import {
  Map,
  PointLike,
  MapMouseEvent,
  MapboxGeoJSONFeature,
  SymbolLayer,
  GeoJSONSource,
  Style,
  VectorSource
} from "mapbox-gl";
import { MapContext } from "../../contexts/MapContext";
import Config from "../../config";
import {
  CabinetBigSvg,
  CabinetBigHighlightSvg,
  CabinetSmallSvg,
  CabinetSmallHighlightSvg,
  CentralOfficeSmallSvg,
  CentralOfficeSmallHighlightSvg,
  HandHoleSvg,
  HandHoleHighlightSvg,
  ConduitClosureSvg,
  ConduitClosureHighlightSvg,
  MapboxStyle,
} from "../../assets";
import {
  SPAN_SEGMENT_TRACE,
  SpanSegmentTraceResponse,
} from "./RouteNetworkMapGql";

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
  callback: (feature: MapboxGeoJSONFeature) => void
) {
  map.on("click", (e) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    // reset last state to avoid multiple selected at the same time
    if (lastHighlightedFeature.current) {
      const lastIsIconLayer = (
        lastHighlightedFeature.current?.layer as SymbolLayer
      ).layout?.["icon-image"];
      if (lastIsIconLayer) {
        map.setLayoutProperty(
          lastHighlightedFeature?.current?.layer?.id,
          "icon-image",
          [
            "match",
            ["id"],
            -1,
            `${lastHighlightedFeature.current.layer.id}_highlight`,
            lastHighlightedFeature.current.layer.id,
          ]
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

    const isIconLayer = (feature.layer as SymbolLayer).layout?.["icon-image"];
    // If its a symbol layer change image -
    // This is required because we cannot use state for icons in mapbox to switch icon.
    if (isIconLayer) {
      map.setLayoutProperty(feature.layer.id, "icon-image", [
        "match",
        ["id"],
        feature.id,
        `${feature.layer.id}_highlight`,
        feature.layer.id,
      ]);
    }

    feature.state.selected = !feature.state.selected;
    map.setFeatureState(feature, {
      ...feature,
      selected: feature.state.selected,
    });

    if (callback) callback(feature);
  });
}

function mapAddImage(map: Map, name: string, icon: string) {
  const img = new Image(20, 20);
  img.src = icon;
  img.onload = () => map.addImage(name, img);
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

function RouteNetworkMap() {
  const client = useClient();
  const mapContainer = useRef<HTMLDivElement>(null);
  const lastHighlightedFeature = useRef<MapboxGeoJSONFeature | null>(null);
  const map = useRef<Map | null>(null);
  const { setIdentifiedFeature, traceRouteNetworkId } = useContext(MapContext);

  useEffect(() => {
    if (!traceRouteNetworkId) {
      if (!map.current) {
        return;
      }

      highlightGeometries(map.current, []);
      return;
    }

    client
      .query<SpanSegmentTraceResponse>(SPAN_SEGMENT_TRACE, {
        spanSegmentId: traceRouteNetworkId,
      })
      .toPromise()
      .then((x) => {
        if (!map.current) {
          return;
        }

        highlightGeometries(
          map.current,
          x.data?.utilityNetwork.spanSegmentTrace
            .routeNetworkSegmentGeometries ?? []
        );
      });
  }, [traceRouteNetworkId, client, map]);

  useEffect(() => {
    console.log(Config.BASEMAP_TILE_SERVER_URI);

    const newMap = new Map({
      container: mapContainer.current ?? "",
      style: {
        ...MapboxStyle as Style,
        sources: {
          route_network: {
            type: "vector",
            tiles: [
              `${Config.ROUTE_NETWORK_TILE_SERVER_URI}/services/route_network/tiles/{z}/{x}/{y}.pbf?dt=${Date.now()}`,
            ],
            minZoom: 0,
            minzoom: 4,
            maxzoom: 17,
          } as VectorSource,
          osm: {
            type: "vector",
            tiles: [
              `${Config.BASEMAP_TILE_SERVER_URI}/services/osm/tiles/{z}/{x}/{y}.pbf`,
            ],
            minZoom: 0,
            maxZoom: 14,
            maxzoom: 14,
          } as VectorSource,
          "basemap-danish": {
            type: "vector",
            tiles: [
              "https://dev-tiles-basemap.openftth.com/services/objects/tiles/{z}/{x}/{y}.pbf"
            ],
            minZoom: 0,
            maxZoom: 14,
            minzoom: 16,
            maxzoom: 16
          } as VectorSource,
        },
      },
      center: [9.996730316498656, 56.04595255289249],
      zoom: 10,
      doubleClickZoom: false,
      dragRotate: false,
    });

    newMap.on("load", () => {
      enableResize(newMap);
      hoverPointer(["route_node", "route_segment"], 10, newMap);
      /* clickHighlight(
       *   ["route_segment", "route_node"],
       *   10,
       *   newMap,
       *   lastHighlightedFeature,
       *   (x) => {
       *     let type: "RouteNode" | "RouteSegment" | null = null;
       *     if (x?.properties?.objecttype === "route_node") {
       *       type = "RouteNode";
       *     } else if (x?.properties?.objecttype === "route_segment") {
       *       type = "RouteSegment";
       *     } else {
       *       throw Error(`${x.type} is not a valid type`);
       *     }

       *     lastHighlightedFeature.current = x;
       *     setIdentifiedFeature({ id: x?.properties?.mrid, type: type });
       *   }
       * );
       */
      newMap.addSource("route_segment_trace", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      /* newMap.addLayer({
       *   id: "route_segment",
       *   source: "route_network",
       *   "source-layer": "route_network",
       *   type: "line",
       *   filter: ["all", ["==", "objecttype", "route_segment"]],
       *   paint: {
       *     "line-color": [
       *       "case",
       *       ["boolean", ["feature-state", "selected"], false],
       *       "#00FF00",
       *       "#FF0000",
       *     ],
       *     "line-width": [
       *       "case",
       *       ["boolean", ["feature-state", "selected"], false],
       *       6,
       *       2,
       *     ],
       *   },
       * });
       */

      newMap.addLayer({
        id: "route_segment_trace",
        type: "line",
        source: "route_segment_trace",
        paint: {
          "line-color": "#40e0d0",
          "line-width": 4,
        },
      });
    });

    map.current = newMap;

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, [setIdentifiedFeature]);

  return (
    <div className="route-network-map">
      <div className="route-network-map-container" ref={mapContainer} />
    </div>
  );
}

export default RouteNetworkMap;
