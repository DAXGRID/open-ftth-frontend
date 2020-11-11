import React, { useEffect, useState } from "react";
import { diagramFeatureLayer, createSource } from "./parseFeatures";
import RouteNodeDiagramObjects from "../../mock/RouteNodeDiagramObjects";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function MapboxDiagram({ config }) {
  const [map, setMap] = useState();
  const [mapContainer, setMapContainer] = useState();
  const [diagramObjects, setDiagramObjects] = useState(RouteNodeDiagramObjects);

  useEffect(() => {
    if (mapContainer) {
      config.container = mapContainer;
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
      const newMap = new mapboxgl.Map(config);
      setMap(newMap);
    }
  }, [mapContainer]);

  useEffect(() => {
    if (map) {
      map.on("load", () => {
        diagramObjects.data.diagramService.buildRouteNodeDiagram.diagramObjects.map(
          (diagramObject, index) => {
            let layer = diagramFeatureLayer(
              createSource(diagramObject),
              diagramObject.style,
              index.toString()
            );
            map.addLayer(layer);
          }
        );
      });
    }
  }, [map]);

  return (
    <div className="diagram">
      <div className="diagram-container" ref={(el) => setMapContainer(el)} />
    </div>
  );
}

export default MapboxDiagram;
