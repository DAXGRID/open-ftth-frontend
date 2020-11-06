import React from "react";
import MapboxDiagram from "./MapboxDiagram";

function SchematicDiagram() {
  const config = {
    center: [0.012, 0.012],
    zoom: 13,
    minZoom: 12,
    style: import.meta.env.VITE_MAP_STYLE_URL,
  };

  return (
    <div>
      <MapboxDiagram config={config} />
    </div>
  );
}

export default SchematicDiagram;
