import { useState, useEffect, useCallback, useContext } from "react";
import RouteNetworkMap from "../RouteNetworkMap";
import RouteNetworkDiagram from "../RouteNetworkDiagram";
import { MapContext } from "../../contexts/MapContext";

function MapDiagram() {
  const [showDiagram, setShowDiagram] = useState(true);
  const { identifiedFeature } = useContext(MapContext);

  useEffect(() => {
    // Hack to handle issue with map not being displayed fully.
    window.dispatchEvent(new Event("resize"));
  }, [showDiagram, identifiedFeature]);

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
      <div
        className={
          showDiagram && identifiedFeature?.id && identifiedFeature.type
            ? "container"
            : "container hide"
        }
      >
        <RouteNetworkDiagram editable={false} />
      </div>
    </div>
  );
}

export default MapDiagram;
