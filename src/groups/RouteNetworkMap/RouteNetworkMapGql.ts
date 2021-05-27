export interface SpanSegmentTraceResponse {
  utilityNetwork: {
    spanSegmentTrace: {
      routeNetworkSegmentGeometries?: string[];
    };
  };
}

export const SPAN_SEGMENT_TRACE = `
query ($spanSegmentId: ID!) {
  utilityNetwork {
    spanSegmentTrace(spanSegmentId: $spanSegmentId) {
      routeNetworkSegmentGeometries
    }
  }
}
`;
