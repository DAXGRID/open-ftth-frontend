import React from "react";
import MapboxDiagram from "./MapboxDiagram";

function SchematicDiagram() {
  const config = {
    center: [0.012, 0.012],
    zoom: 13,
    minZoom: 12,
    style: "mapbox://styles/openftth-dev/ckh61vsf00t9u19k6anx4k7pt",
  };

  return (
    <div>
      <MapboxDiagram config={config} />
    </div>
  );
}

export default SchematicDiagram;
