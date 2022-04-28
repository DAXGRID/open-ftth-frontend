export interface SpanSegmentTraceResponse {
  utilityNetwork: {
    spanSegmentTrace: {
      routeNetworkSegmentGeometries?: string[];
      routeNetworkSegmentIds?: string[];
      wgs84MinX: number;
      wgs84MinY: number;
      wgs84MaxX: number;
      wgs84MaxY: number;
      etrs89MinX: number;
      etrs89MinY: number;
      etrs89MaxX: number;
      etrs89MaxY: number;
    };
  };
}

export const SPAN_SEGMENT_TRACE = `
query ($spanSegmentId: ID!) {
  utilityNetwork {
    spanSegmentTrace(spanSegmentId: $spanSegmentId) {
      routeNetworkSegmentGeometries
      routeNetworkSegmentIds
      wgs84MinX: wGS84MinX
      wgs84MinY: wGS84MinY
      wgs84MaxX: wGS84MaxX
      wgs84MaxY: wGS84MaxY
      etrs89MinX: eTRS89MinX
      etrs89MinY: eTRS89MinY
      etrs89MaxX: eTRS89MaxX
      etrs89MaxY: eTRS89MaxY
    }
  }
}
`;
