import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Config from '../../config';

function useMapbox() {
  const map = useRef(null);
  const selectedFeatures = useRef([]);
  const [config, setConfig] = useState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!config) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    mapboxgl.accessToken = Config.MAPBOX_API_KEY;
    const newMap = new mapboxgl.Map(config);
    newMap.on('load', mapLoaded);

    map.current = newMap;

    return () => {
      map.current.off('load', mapLoaded);
    };
  }, [config]);

  function mapLoaded() {
    setLoaded(true);
  }

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

  function clickHighlight(featureName) {
    map.current.on('click', featureName, (e) => {
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];

      const feature = map.current.queryRenderedFeatures(bbox)[0];
      if (feature.source !== featureName) return;

      const featureSelected = feature.state.selected;

      updateSelectedFeatures(feature);

      map.current.setFeatureState(
        { source: featureName, id: feature.id },
        { selected: !featureSelected },
      );
    });
  }

  function updateSelectedFeatures(feature) {
    if (!feature.state.selected) {
      selectedFeatures.current = [...selectedFeatures.current, feature];
    } else {
      selectedFeatures.current = selectedFeatures.current.filter(
        (x) => x.id !== feature.id,
      );
    }
  }

  function hoverHighlight(featureName) {
    let hoveredId = null;
    map.current.on('mousemove', featureName, (e) => {
      map.current.getCanvas().style.cursor = 'pointer';
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];
      const features = map.current.queryRenderedFeatures(bbox);
      if (features.length > 0) {
        if (hoveredId) {
          map.current.setFeatureState(
            { source: featureName, id: hoveredId },
            { hover: false },
          );
        }
        hoveredId = features[0].id;
        map.current.setFeatureState(
          { source: featureName, id: hoveredId },
          { hover: true },
        );
      }
    });

    map.current.on('mouseleave', featureName, () => {
      map.current.getCanvas().style.cursor = '';
      if (hoveredId) {
        map.current.setFeatureState(
          { source: featureName, id: hoveredId },
          { hover: false },
        );
      }
    });
  }

  function enableResize() {
    window.addEventListener('resize', () => {
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
    selectedFeatures: selectedFeatures.current,
  };
}

export default useMapbox;
