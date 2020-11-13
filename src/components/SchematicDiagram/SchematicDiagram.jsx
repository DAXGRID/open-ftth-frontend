import React, { useState, useEffect } from "react";
import useMapbox from "./useMapbox.js";
import { diagramFeatureLayer, createSource } from "./parseFeatures";
import RouteNodeDiagramObjects from "../../mock/RouteNodeDiagramObjects";

function SchematicDiagram() {
  const [mapContainer, setMapContainer] = useState();
  const { setConfig, addLayer, loaded, setOnClicked } = useMapbox();

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

  useEffect(() => {
    if (loaded) {
      addLayers();
      setOnClicked();
    }
  }, [loaded]);

  function addLayers() {
    RouteNodeDiagramObjects.data.diagramService.buildRouteNodeDiagram.diagramObjects.map(
      (diagramObject, index) => {
        const layer = diagramFeatureLayer(
          createSource(diagramObject),
          diagramObject.style,
          index.toString()
        );

        addLayer(layer);
      }
    );
  }

  return (
    <div className="schematic-diagram">
      <div
        className="schematic-diagram-container"
        ref={(el) => setMapContainer(el)}
      />
    </div>
  );
}

export default SchematicDiagram;
