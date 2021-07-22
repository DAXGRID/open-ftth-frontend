export interface QueryRouteNetworkElementResponse {
  routeNetwork: {
    routeElement: {
      routeNodeInfo?: {
        function?: string;
        kind?: string;
      };
      namingInfo?: {
        name?: string;
      };
      routeSegmentInfo?: {
        kind?: string;
      };
    };
  };
}

export const QUERY_ROUTE_NETWORK_ELEMENT = `
query ($routeElementId: ID!) {
  routeNetwork {
    routeElement(id: $routeElementId) {
      routeNodeInfo {
        function
        kind
      }
      namingInfo {
        name
      }
      routeSegmentInfo {
        kind
      }
    }
  }
}
`;
