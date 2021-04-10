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
