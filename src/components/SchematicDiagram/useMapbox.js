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

  function addLayer(layer, layerName) {
    if (map.getLayer(layer.id)) return;

    if (layerName) {
      map.addLayer(layer, layerName);
    } else {
      map.addLayer(layer);
    }
  }

  function addSource(name, source) {
    const mapSource = map.getSource(name);
    if (!mapSource) {
      map.addSource(name, source);
    } else {
      mapSource.setData(source.data);
    }
  }

  function mapClick(callback) {
    map.on("click", (e) => {
      var bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];
      var features = map.queryRenderedFeatures(bbox);
      callback(features);
    });
  }

  function hoverHighlight(featureName) {
    let hoveredId = null;
    map.on("mousemove", featureName, function (e) {
      map.getCanvas().style.cursor = "pointer";
      var bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];
      var features = map.queryRenderedFeatures(bbox);
      if (features.length > 0) {
        if (hoveredId) {
          map.setFeatureState(
            { source: featureName, id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = features[0].id;
        map.setFeatureState(
          { source: featureName, id: hoveredId },
          { hover: true }
        );
      }
    });

    map.on("mouseleave", featureName, function () {
      map.getCanvas().style.cursor = "";
      if (hoveredId) {
        map.setFeatureState(
          { source: featureName, id: hoveredId },
          { hover: false }
        );
      }
    });
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
    mapClick,
    hoverHighlight,
  };
}

export default useMapbox;
