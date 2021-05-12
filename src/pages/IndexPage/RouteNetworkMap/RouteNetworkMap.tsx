import { useEffect, useRef } from "react";
import { Map, PointLike, MapMouseEvent } from "mapbox-gl";
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

function hoverPointer(featureName: string, map: Map) {
  map.on("mousemove", (e: MapMouseEvent) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - 10, e.point.y - 10],
      [e.point.x + 10, e.point.y + 10],
    ];

    var features = map.queryRenderedFeatures(bbox, {
      layers: ["route_segment"],
    });

    if (features.length > 0) {
      map.getCanvas().style.cursor = "pointer";
    } else {
      map.getCanvas().style.cursor = "";
    }
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
      hoverPointer("route_segment", newMap);

      let img = new Image(20, 20);
      img.onload = () => newMap.addImage("cabinet_big", img);
      img.src = CabinetBigSvg;

      newMap.addImage("skab", img);

      newMap.addSource("openftth", {
        type: "vector",
        tiles: ["http://20.76.242.112/services/out/tiles/{z}/{x}/{y}.pbf"],
        minzoom: 4,
        maxzoom: 24,
      });

      newMap.addLayer({
        id: "route_segment",
        source: "openftth",
        "source-layer": "output",
        type: "line",
        paint: {
          "line-color": "#FF0000",
          "line-width": 2,
        },
      });

      /* newMap.addLayer({
       *   id: "route_node",
       *   source: "openftth",
       *   "source-layer": "route_node",
       *   type: "symbol",
       *   layout: {
       *     "icon-image": "cabinet_big", // reference the image
       *     "icon-size": 1,
       *   },
       * }); */
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
