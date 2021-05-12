import { useEffect, useRef } from "react";
import { Map, PointLike, MapMouseEvent, MapboxGeoJSONFeature } from "mapbox-gl";
import { CabinetBigSvg } from "../../../assets";

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
      layers: [...featureNames],
    });

    if (features.length > 0) {
      map.getCanvas().style.cursor = "pointer";
    } else {
      map.getCanvas().style.cursor = "";
    }
  });
}

function clickHighlight(
  featureName: string,
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

    if (feature.layer.id !== featureName) {
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

function RouteNetworkMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    const newMap = new Map({
      container: mapContainer.current ?? "",
      style:
        "https://api.maptiler.com/maps/basic/style.json?key=AI2XImJGt0ewRiF5VtVQ",
      center: [9.841181882076398, 55.86205081435847],
      zoom: 18,
    });

    newMap.on("load", () => {
      newMap.doubleClickZoom.disable();
      newMap.dragRotate.disable();
      enableResize(newMap);
      hoverPointer(["route_segment", "route_segment"], 10, newMap);
      clickHighlight("route_segment", 10, newMap, (x) => {
        console.log(x);
      });

      clickHighlight("route_node", 10, newMap, (x) => {
        console.log(x);
      });

      newMap.addSource("route_network", {
        type: "vector",
        tiles: [
          "http://tiles.openftth.local/services/route_network/tiles/{z}/{x}/{y}.pbf",
        ],
        minzoom: 4,
        maxzoom: 22,
      });

      newMap.addLayer({
        id: "route_node",
        source: "route_network",
        minzoom: 14,
        maxzoom: 22,
        "source-layer": "route_nodes",
        type: "circle",
        paint: {
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#00FF00",
            "#FF0000",
          ],
        },
      });

      newMap.addLayer({
        id: "route_segment",
        source: "route_network",
        minzoom: 4,
        maxzoom: 24,
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
    });

    map.current = newMap;

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="route-network-map">
      <div className="route-network-map-container" ref={mapContainer} />
    </div>
  );
}

export default RouteNetworkMap;