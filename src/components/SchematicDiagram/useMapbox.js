import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function useMapbox() {
  const [map, setMap] = useState();
  const [config, setConfig] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!config) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
    const newMap = new mapboxgl.Map(config);
    newMap.on("load", () => {
      setLoaded(true);
    });

    setMap(newMap);
  }, [config]);

  function setOnClicked() {
    if (!map && !loaded) return;

    map.on("click", () => {
      console.log("test");
    });
  }

  function addLayer(layer) {
    if (!map && !loaded) return;

    map.addLayer(layer);
  }

  function resize() {
    if (!map && !loaded) return;

    console.log(map);
    map.resize();
  }

  return {
    setConfig,
    addLayer,
    loaded,
    setOnClicked,
    resize,
  };
}

export default useMapbox;
