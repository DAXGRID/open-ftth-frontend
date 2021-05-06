import { useEffect, useRef } from "react";
import { Map } from "mapbox-gl";
import { CabinetBigSvg } from "../../../assets";

function RouteNetworkMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    const newMap = new Map({
      container: mapContainer.current ?? "",
      style:
        "https://api.maptiler.com/maps/basic/style.json?key=AI2XImJGt0ewRiF5VtVQ",
      center: [0, 0],
      zoom: 1,
    });

    newMap.on("load", () => {
      let img = new Image(20, 20);
      img.onload = () => newMap.addImage("cabinet_big", img);
      img.src = CabinetBigSvg;

      newMap.addImage("skab", img);

      newMap.addSource("openftth", {
        type: "vector",
        tiles: ["http://20.76.192.195/services/out/tiles/{z}/{x}/{y}.pbf"],
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
          "line-width": 1,
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
