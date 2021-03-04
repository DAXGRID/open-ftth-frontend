import { getStyle, Style } from "./diagramStyles";

interface Layer extends Style {
  id: string;
  order: number;
  source: string;
}

export function createLayer(styleName: string) {
  const styleProps = getStyle(styleName);

  let layer: Layer = {
    id: styleName,
    order: 0,
    source: styleName,
    ...styleProps,
  };

  return layer;
}

// export function createSource(feature: any) {
//   return {
//     type: "geojson",
//     data: {
//       type: "FeatureCollection",
//       features: [
//         {
//           type: "Feature",
//           properties: {
//             label: feature.label,
//             type: feature.style,
//             refId: feature.refId,
//           },
//           geometry: feature.geometry,
//         },
//       ],
//     },
//   };
// }
