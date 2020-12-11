import { schematicDiagramLayers } from "./diagramStyles";

export function createLayer(featureType) {
  let layer = {
    id: featureType,
    order: 0,
    source: featureType,
  };

  let styleProps = schematicDiagramLayers[featureType];
  if (!styleProps) {
    styleProps = schematicDiagramLayers.default;
  }

  layer = {
    ...layer,
    ...styleProps,
  };

  return layer;
}

export function createSource(feature) {
  return {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            label: feature.label,
            type: feature.style,
            refId: feature.refId,
          },
          geometry: feature.geometry,
        },
      ],
    },
  };
}
