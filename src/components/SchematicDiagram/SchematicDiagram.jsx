import React, { useRef, useEffect } from "react";
import useMapbox from "./useMapbox.js";
import {
  createLayer,
  createSource,
  innerConduitHighlight,
  multiConduitHighlight,
  innerConduitSelect,
  multiConduitSelect,
} from "./parseFeatures";
import RouteNodeDiagramObjects from "../../mock/RouteNodeDiagramObjects";
import Config from "../../config";

function SchematicDiagram() {
  const mapContainer = useRef(null);
  const {
    clickHighlight,
    setConfig,
    addLayer,
    addSource,
    loaded,
    enableResize,
    hoverHighlight,
  } = useMapbox();

  useEffect(() => {
    if (mapContainer.current) {
      setConfig({
        center: [0.014, 0.014],
        zoom: 14,
        minZoom: 12,
        style: Config.MAPBOX_STYLE_URI,
        container: mapContainer.current,
      });
    }

    return () => {
      mapContainer.current = null;
    };
  }, [mapContainer]);

  useEffect(() => {
    if (loaded) {
      insertSchematicDiagramData();
      enableResize();
      addLayer(innerConduitHighlight);
      hoverHighlight("InnerConduit");
      addLayer(multiConduitHighlight, "InnerConduit");
      hoverHighlight("MultiConduit");
      addLayer(innerConduitSelect);
      clickHighlight("InnerConduit");
      addLayer(multiConduitSelect);
      clickHighlight("MultiConduit");
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
        else if (style.includes("MultiConduit")) style = "MultiConduit";

        if (!sourcesToAdd[style]) {
          sourcesToAdd[style] = source;
        } else {
          sourcesToAdd[style].data.features.push(...source.data.features);
        }

        if (!layersToAdd.includes(style)) {
          const layer = createLayer(style);
          layersToAdd.push(layer);
        }
      }
    );

    let counter = 1;
    for (const source in sourcesToAdd) {
      // Adds ids to each feature to make it possible to hover over them
      sourcesToAdd[source].data.features.forEach((f) => {
        f.id = counter;
        counter++;
      });

      addSource(source, sourcesToAdd[source]);
    }

    layersToAdd.forEach((x) => addLayer(x));
  }

  return (
    <div className="schematic-diagram">
      <div className="schematic-diagram-container" ref={mapContainer} />
    </div>
  );
}

export default SchematicDiagram;
