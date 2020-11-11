import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function useMapbox() {
  const [map, setMap] = useState();
  const [config, setConfig] = useState();

  useEffect(() => {
    if (config) {
      debugger;
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
      const newMap = new mapboxgl.Map(config);
      setMap(newMap);
    }
  }, [config]);

  return [setConfig];
}

export default useMapbox;
