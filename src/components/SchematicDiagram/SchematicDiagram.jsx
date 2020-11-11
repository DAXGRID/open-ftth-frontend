import React, { useState, useEffect } from "react";
import useMapbox from "./useMapbox.js";

function SchematicDiagram() {
  const [mapContainer, setMapContainer] = useState();
  const [setConfig] = useMapbox();

  useEffect(() => {
    if (mapContainer) {
      setConfig({
        center: [0.012, 0.012],
        zoom: 13,
        minZoom: 12,
        style: "mapbox://styles/openftth-dev/ckh61vsf00t9u19k6anx4k7pt",
        container: mapContainer,
      });
    }
  }, [mapContainer]);

  return (
    <div className="diagram">
      <div className="diagram-container" ref={(el) => setMapContainer(el)} />
    </div>
  );
}

export default SchematicDiagram;
