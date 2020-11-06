import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function MapboxDiagram({ config }) {
  const [map, setMap] = useState();
  const [mapContainer, setMapContainer] = useState();

  useEffect(() => {
    if (mapContainer) {
      config.container = mapContainer;
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
      const map = new mapboxgl.Map(config);
      setMap(map);
    }
  }, [mapContainer]);

  return (
    <div className="diagram">
      <div className="diagram-container" ref={(el) => setMapContainer(el)} />
    </div>
  );
}

export default MapboxDiagram;
