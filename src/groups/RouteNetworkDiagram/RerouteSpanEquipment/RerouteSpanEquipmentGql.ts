export interface GetRouteSegmentIdsResponse {
  utilityNetwork: {
    spanEquipment: {
      routeSegmentIds: string[];
    };
  };
}

export interface GetRouteSegmentIdsParameter {
  spanEquipmentOrSegmentId: string;
}

export const QUERY_GET_ROUTESEGMENT_IDS = `
query ($spanEquipmentOrSegmentId: ID!) {
  utilityNetwork {
    spanEquipment(
      spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId
    )
    {
      routeSegmentIds
    }
  }
}
`;

export interface RerouteResponse {
  spanEquipment: {
    move: {
      isSuccess: boolean;
      errorCode: string;
    };
  };
}

export interface RerouteParameter {
  spanEquipmentOrSegmentId: string;
  routeSegmentIds: string[];
}

export const MUTATION_REROUTE = `
mutation ($spanEquipmentOrSegmentId: ID!, $routeSegmentIds: [ID!]!) {
  spanEquipment {
    move(
      spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId
      routeSegmentIds: $routeSegmentIds
    ) {
      isSuccess
      errorCode
    }
  }
}
`;
