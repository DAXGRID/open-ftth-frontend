import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function useMapbox() {
  const [map, setMap] = useState();
  const [config, setConfig] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (config) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
      const newMap = new mapboxgl.Map(config);
      newMap.on("load", () => {
        setLoaded(true);
      });

      setMap(newMap);
    }

    return () => {
      setMap(null);
    };
  }, [config]);

  function addLayer(layer) {
    if (map) {
      map.addLayer(layer);
    }
  }

  function destroyMap() {
    if (map) {
      map.remove();
    }
  }

  return {
    setConfig,
    addLayer,
    loaded,
    destroyMap,
  };
}

export default useMapbox;
