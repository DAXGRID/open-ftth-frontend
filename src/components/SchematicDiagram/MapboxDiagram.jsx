import React, { useEffect, useState } from "react";
import { diagramFeatureLayer } from "./parseFeatures";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function MapboxDiagram({ config }) {
  const [map, setMap] = useState();
  const [mapContainer, setMapContainer] = useState();

  useEffect(() => {
    if (mapContainer) {
      config.container = mapContainer;
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
      const newMap = new mapboxgl.Map(config);
      setMap(newMap);
    }
  }, [mapContainer]);

  useEffect(() => {
    if (map) {
      map.on("load", () => {
        const source = getSource();
        map.addSource("DF_InnerConduitOrange", source);
        let layer = diagramFeatureLayer("Polygon", "DF_InnerConduitOrange");
        map.addLayer(layer);
      });
    }
  }, [map]);

  return (
    <div className="diagram">
      <div className="diagram-container" ref={(el) => setMapContainer(el)} />
    </div>
  );
}

function getSource() {
  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0.004, 0.0152],
                [0.034, 0.0152],
                [0.034, 0.016],
                [0.004, 0.016],
                [0.004, 0.0152],
              ],
            ],
          },
        },
      ],
    },
  };
}

export default MapboxDiagram;
