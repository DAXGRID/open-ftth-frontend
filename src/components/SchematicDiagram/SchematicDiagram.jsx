import React, { useState, useEffect } from "react";
import useMapbox from "./useMapbox.js";
import {
  createLayer,
  createSource,
  innerConduitHighlight,
} from "./parseFeatures";
import RouteNodeDiagramObjects from "../../mock/RouteNodeDiagramObjects";
import Config from "../../config";

function SchematicDiagram() {
  const [mapContainer, setMapContainer] = useState();
  const {
    map,
    setConfig,
    addLayer,
    addSource,
    loaded,
    enableResize,
    mapClick,
    hoverHighlight,
  } = useMapbox();

  useEffect(() => {
    if (mapContainer) {
      setConfig({
        center: [0.014, 0.014],
        zoom: 14,
        minZoom: 12,
        style: Config.MAPBOX_STYLE_URI,
        container: mapContainer,
      });
    }
  }, [mapContainer]);

  useEffect(() => {
    if (loaded) {
      insertSchematicDiagramData();
      enableResize();
      hoverHighlight("InnerConduit");
      addLayer(innerConduitHighlight);
      mapClick((features) => {
        console.log(features);
      });
    }
  }, [loaded]);

  function insertSchematicDiagramData() {
    const sourcesToAdd = {};
    const layersToAdd = [];

    RouteNodeDiagramObjects.data.diagramService.buildRouteNodeDiagram.diagramObjects.map(
      (diagramObject) => {
        const source = createSource(diagramObject);

        let style = diagramObject.style;
        if (style.includes("InnerConduit")) style = "InnerConduit";

        if (!sourcesToAdd[style]) {
          sourcesToAdd[style] = source;
        } else {
          sourcesToAdd[style].data.features.push(...source.data.features);
          // Adds ids to each feature to make it possible to hover over them
          sourcesToAdd[style].data.features.forEach((f, i) => {
            f.id = i + 1;
          });
        }

        if (!layersToAdd.includes(style)) {
          const layer = createLayer(style);
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
