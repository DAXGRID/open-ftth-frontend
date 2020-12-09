import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Config from "../../config";

function useMapbox() {
  const map = useRef(null);
  const [config, setConfig] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!config) return;

    mapboxgl.accessToken = Config.MAPBOX_API_KEY;
    const newMap = new mapboxgl.Map(config);
    newMap.on("load", () => {
      setLoaded(true);
    });

    map.current = newMap;
  }, [config]);

  function addLayer(layer, layerName) {
    if (map.current.getLayer(layer.id)) return;

    if (layerName) {
      map.current.addLayer(layer, layerName);
    } else {
      map.current.addLayer(layer);
    }
  }

  function addSource(name, source) {
    const mapSource = map.current.getSource(name);
    if (!mapSource) {
      map.current.addSource(name, source);
    } else {
      mapSource.setData(source.data);
    }
  }

  function clickHighlight(featureName, callback) {
    map.current.on("click", featureName, (e) => {
      var bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];

      var feature = map.current.queryRenderedFeatures(bbox)[0];
      const featureSelected = feature.state.selected;

      map.current.setFeatureState(
        { source: featureName, id: feature.id },
        { selected: !featureSelected }
      );

      if (callback) callback(feature, !featureSelected);
    });
  }

  function hoverHighlight(featureName) {
    let hoveredId = null;
    map.current.on("mousemove", featureName, (e) => {
      map.current.getCanvas().style.cursor = "pointer";
      var bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];
      var features = map.current.queryRenderedFeatures(bbox);
      if (features.length > 0) {
        if (hoveredId) {
          map.current.setFeatureState(
            { source: featureName, id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = features[0].id;
        map.current.setFeatureState(
          { source: featureName, id: hoveredId },
          { hover: true }
        );
      }
    });

    map.current.on("mouseleave", featureName, () => {
      map.current.getCanvas().style.cursor = "";
      if (hoveredId) {
        map.current.setFeatureState(
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
    map: map.current,
    setConfig,
    addLayer,
    addSource,
    loaded,
    enableResize,
    hoverHighlight,
    clickHighlight,
  };
}

export default useMapbox;
