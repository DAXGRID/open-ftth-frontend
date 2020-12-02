import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Config from "../../config";

function useMapbox() {
  const [map, setMap] = useState();
  const [config, setConfig] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!config) return;

    mapboxgl.accessToken = Config.MAPBOX_API_KEY;
    const newMap = new mapboxgl.Map(config);
    newMap.on("load", () => {
      setLoaded(true);
    });

    setMap(newMap);
  }, [config]);

  function addLayer(layer) {
    if (map.getLayer(layer.id)) return;
    map.addLayer(layer);
  }

  function addSource(name, source) {
    const mapSource = map.getSource(name);
    if (!mapSource) {
      map.addSource(name, source);
    } else {
      mapSource.setData(source.data);
    }
  }

  function enableResize() {
    window.addEventListener("resize", () => {
      // Hack to handle resize of mapcanvas because
      // the event gets called to early, so we have to queue it up
      setTimeout(() => {
        map.resize();
      }, 1);
    });
  }

  return {
    map,
    setConfig,
    addLayer,
    addSource,
    loaded,
    enableResize,
  };
}

export default useMapbox;
