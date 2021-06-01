export interface SpanSegmentTraceResponse {
  utilityNetwork: {
    spanSegmentTrace: {
      routeNetworkSegmentIds?: string[];
    };
  };
}

export const SPAN_SEGMENT_TRACE = `
query ($spanSegmentId: ID!) {
  utilityNetwork {
    spanSegmentTrace(spanSegmentId: $spanSegmentId) {
      routeNetworkSegmentIds
    }
  }
}
`;
