import React, { useState, useEffect } from "react";
import useMapbox from "./useMapbox.js";
import { createLayer, createSource } from "./parseFeatures";
import RouteNodeDiagramObjects from "../../mock/RouteNodeDiagramObjects";
import Config from "../../config";

function SchematicDiagram() {
  const [mapContainer, setMapContainer] = useState();
  const {
    setConfig,
    addLayer,
    addSource,
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
      addData();
      setOnClicked();
      enableResize();
    }
  }, [loaded]);

  function addData() {
    const sourcesToAdd = {};
    const layersToAdd = [];

    RouteNodeDiagramObjects.data.diagramService.buildRouteNodeDiagram.diagramObjects.map(
      (diagramObject) => {
        const source = createSource(diagramObject);

        if (!sourcesToAdd[diagramObject.style]) {
          sourcesToAdd[diagramObject.style] = source;
        } else {
          sourcesToAdd[diagramObject.style].data.features.push(
            ...source.data.features
          );
        }

        if (!layersToAdd.includes(diagramObject.style)) {
          const layer = createLayer(diagramObject.style);
          layersToAdd.push(layer);
        }
      }
    );

    for (const source in sourcesToAdd) {
      addSource(source, sourcesToAdd[source]);
    }

    layersToAdd.forEach((x) => addLayer(x));
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
