import React, { useLayoutEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function Diagram() {
  const [map, setMap] = useState();
  const [mapContainer, setMapContainer] = useState();

  useLayoutEffect(() => {
    if (mapContainer) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

      const map = new mapboxgl.Map({
        container: mapContainer,
        style: import.meta.env.VITE_STYLE_URL,
        center: [0, 0],
        zoom: 2,
      });

      setMap(map);
    }
  }, [mapContainer]);

  return (
    <div className="diagram">
      <div className="diagram-container" ref={(el) => setMapContainer(el)} />
    </div>
  );
}

export default Diagram;
