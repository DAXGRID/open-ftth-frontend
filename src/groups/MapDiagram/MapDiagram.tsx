import { useState, useEffect, useCallback, useContext } from "react";
import RouteNetworkMap from "../RouteNetworkMap";
import RouteNetworkDiagram from "../RouteNetworkDiagram";
import { MapContext } from "../../contexts/MapContext";
import TabMenuTop from "./TabMenuTop";

function MapDiagram() {
  const { identifiedFeature } = useContext(MapContext);
  const [showDiagram, setShowDiagram] = useState(true);
  const [selectedViewId, setSelectedViewId] = useState<number>(0);

  useEffect(() => {
    // Hack to handle issue with map not being displayed fully.
    window.dispatchEvent(new Event("resize"));
  }, [showDiagram, identifiedFeature, selectedViewId]);

  const toggleDiagram = useCallback(
    (show: boolean) => {
      setShowDiagram(show);
    },
    [setShowDiagram]
  );

  return (
    <>
      <div className="map-diagram map-diagram--desktop">
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

      <div className="map-diagram map-diagram--mobile">
        <TabMenuTop
          selectedViewId={selectedViewId}
          setSelectedViewId={setSelectedViewId}
          views={[
            {
              id: 0,
              text: "Map",
              view: <RouteNetworkMap showSchematicDiagram={toggleDiagram} />,
            },
            {
              id: 1,
              text: "Details",
              view: <RouteNetworkDiagram editable={false} />,
            },
          ]}
        ></TabMenuTop>
      </div>
    </>
  );
}

export default MapDiagram;
