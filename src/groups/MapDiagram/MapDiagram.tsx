import { useState, useEffect, useCallback } from "react";
import RouteNetworkMap from "../RouteNetworkMap";
import RouteNetworkDiagram from "../RouteNetworkDiagram";

function MapDiagram() {
  const [showDiagram, setShowDiagram] = useState(true);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [showDiagram]);

  const toggleDiagram = useCallback(
    (show: boolean) => {
      setShowDiagram(show);
    },
    [setShowDiagram]
  );

  return (
    <div className="map-diagram">
      <div className="container">
        <RouteNetworkMap showSchematicDiagram={toggleDiagram} />
      </div>

      <div className={showDiagram ? "container" : "container hide"}>
        <RouteNetworkDiagram enableEditMode={false} />
      </div>
    </div>
  );
}

export default MapDiagram;
