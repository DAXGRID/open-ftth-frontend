import { useEffect, useRef, useContext } from "react";
import { Map, PointLike, MapMouseEvent, MapboxGeoJSONFeature } from "mapbox-gl";
import { MapContext } from "../../contexts/MapContext";
import Config from "../../config";
import {
  CabinetBigSvg,
  CabinetSmallSvg,
  CentralOfficeSmallSvg,
  HandHoleSvg,
  ConduitClosureSvg,
} from "../../assets";

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
          return ["==", "layer", x];
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
  callback: (feature: MapboxGeoJSONFeature) => void
) {
  map.on("click", (e) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    const feature = map.queryRenderedFeatures(bbox)[0];

    if (
      !feature ||
      !featureNames.find((x) => x === feature.properties?.layer)
    ) {
      return;
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

function RouteNetworkMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const { setIdentifiedFeature } = useContext(MapContext);

  useEffect(() => {
    const newMap = new Map({
      container: mapContainer.current ?? "",
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
      },
      center: [9.996730316498656, 56.04595255289249],
      zoom: 10,
      doubleClickZoom: false,
      dragRotate: false,
    });

    newMap.on("load", () => {
      enableResize(newMap);
      hoverPointer(["route_node", "route_segment"], 10, newMap);
      clickHighlight(["route_segment", "route_node"], 10, newMap, (x) => {
        console.log(newMap.getCenter());
        let type: "RouteNode" | "RouteSegment" | null = null;
        if (x?.properties?.layer === "route_node") {
          type = "RouteNode";
        } else if (x?.properties?.layer === "route_segment") {
          type = "RouteSegment";
        } else {
          throw Error(`${x.type} is not a valid type`);
        }

        setIdentifiedFeature({ id: x?.properties?.mrid, type: type });
      });

      newMap.addSource("route_network", {
        type: "vector",
        tiles: [
          `${Config.ROUTE_NETWORK_TILE_SERVER_URI}/services/route_network/tiles/{z}/{x}/{y}.pbf`,
        ],
        minzoom: 4,
        maxzoom: 22,
      });

      mapAddImage(newMap, "central_office_small", CentralOfficeSmallSvg);
      mapAddImage(newMap, "cabinet_big", CabinetBigSvg);
      mapAddImage(newMap, "cabinet_small", CabinetSmallSvg);
      mapAddImage(newMap, "hand_hole", HandHoleSvg);
      mapAddImage(newMap, "conduit_closure", ConduitClosureSvg);

      newMap.addLayer({
        id: "route_segment",
        source: "route_network",
        "source-layer": "route_segments",
        type: "line",
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#00FF00",
            "#FF0000",
          ],
          "line-width": 2,
        },
      });

      newMap.addLayer({
        id: "route_node_central_office_small",
        source: "route_network",
        "source-layer": "out",
        type: "symbol",
        filter: ["all", ["==", "kind", "CentralOfficeSmall"]],
        layout: {
          "icon-image": "central_office_small",
          "icon-size": 1,
          "icon-allow-overlap": true,
        },
      });

      newMap.addLayer({
        id: "route_node_conduit_closure",
        source: "route_network",
        "source-layer": "out",
        type: "symbol",
        filter: ["all", ["==", "kind", "ConduitClosure"]],
        layout: {
          "icon-image": "conduit_closure",
          "icon-size": 1,
          "icon-allow-overlap": true,
        },
      });

      newMap.addLayer({
        id: "route_node_cabinet_big",
        source: "route_network",
        "source-layer": "out",
        type: "symbol",
        filter: ["all", ["==", "kind", "CabinetBig"]],
        layout: {
          "icon-image": "cabinet_big",
          "icon-size": 1,
          "icon-allow-overlap": true,
        },
      });

      newMap.addLayer({
        id: "route_node_cabinet_small",
        source: "route_network",
        "source-layer": "out",
        type: "symbol",
        filter: ["all", ["==", "kind", "CabinetSmall"]],
        layout: {
          "icon-image": "cabinet_small",
          "icon-size": 1,
          "icon-allow-overlap": true,
        },
      });

      newMap.addLayer({
        id: "route_node_hand_hole",
        source: "route_network",
        "source-layer": "out",
        type: "symbol",
        filter: ["all", ["==", "kind", "HandHole"]],
        layout: {
          "icon-image": "hand_hole",
          "icon-size": 1,
          "icon-allow-overlap": true,
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
