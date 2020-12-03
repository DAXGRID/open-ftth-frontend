import React, { useState, useEffect } from "react";
import useMapbox from "./useMapbox.js";
import { createLayer, createSource } from "./parseFeatures";
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
      addData();
      enableResize();
      highlight();
    }
  }, [loaded]);

  function highlight() {
    let hoveredId = null;
    map.on("click", (e) => {
      var bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];
      var features = map.queryRenderedFeatures(bbox);
      console.log(features[0]);
    });

    map.on("mousemove", "InnerConduit", function (e) {
      map.getCanvas().style.cursor = "pointer";
      var bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ];
      var features = map.queryRenderedFeatures(bbox);
      if (features.length > 0) {
        if (hoveredId) {
          map.setFeatureState(
            { source: "InnerConduit", id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = features[0].id;
        map.setFeatureState(
          { source: "InnerConduit", id: hoveredId },
          { hover: true }
        );
      }
    });

    map.on("mouseleave", "InnerConduit", function () {
      map.getCanvas().style.cursor = "";
      if (hoveredId) {
        map.setFeatureState(
          { source: "InnerConduit", id: hoveredId },
          { hover: false }
        );
      }
    });
  }

  function addData() {
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

    map.addLayer({
      id: "inner-conduit-fills",
      type: "fill",
      source: "InnerConduit",
      layout: {},
      paint: {
        "fill-color": "#ccc",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1.0,
          0,
        ],
      },
    });
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
