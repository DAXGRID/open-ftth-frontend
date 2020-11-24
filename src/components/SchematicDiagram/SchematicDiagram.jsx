import React, { useState, useEffect } from "react";
import useMapbox from "./useMapbox.js";
import { diagramFeatureLayer, createSource } from "./parseFeatures";
import RouteNodeDiagramObjects from "../../mock/RouteNodeDiagramObjects";
import Config from "../../config";

function SchematicDiagram() {
  const [mapContainer, setMapContainer] = useState();
  const {
    setConfig,
    addLayer,
    loaded,
    setOnClicked,
    enableResize,
  } = useMapbox();

  useEffect(() => {
    if (mapContainer) {
      setConfig({
        center: [0.012, 0.012],
        zoom: 14,
        minZoom: 12,
        style: Config.MAPBOX_STYLE_URI,
        container: mapContainer,
      });
    }
  }, [mapContainer]);

  useEffect(() => {
    if (loaded) {
      addLayers();
      setOnClicked();
      enableResize();
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
