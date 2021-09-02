export type UnitAddress = {
  id: string;
  floorName: string;
  suitName: string;
  externalId: string;
};

type AccessAddress = {
  id: string;
  roadName: string;
  houseNumber: string;
  townName: string;
  postDistrict: string;
  unitAddresses: UnitAddress[];
};

export type NearestAccessAddress = {
  distance: number;
  accessAddress: AccessAddress;
};

export type NearestAccessAddressesResponse = {
  addressService: {
    nearestAccessAddresses: NearestAccessAddress[];
  };
};

export const NEAREST_ACCESS_ADDRESSES_QUERY = `
query($routeNodeId: ID!) {
  addressService {
    nearestAccessAddresses(routeNodeId: $routeNodeId, maxHits: 10) {
      distance
      accessAddress {
        id
        roadName
        houseNumber
        townName
        postDistrict
        unitAddresses {
          id
          floorName
          suitName
          externalId
        }
      }
    }
  }
}`;

export type NeighborNode = {
  id: string;
  name: string;
  distance: number;
  routeNetworkSegmentIds: string[];
  routeNetworkSegmentGeometries: string[];
};

export type NearestNeighborNodesResponse = {
  routeNetwork: {
    nearestNeighborNodes: NeighborNode[];
  };
};

export const NEAREST_NEIGHBOR_NODES_QUERY = `
query($sourceRouteNodeId: ID!) {
  routeNetwork {
    nearestNeighborNodes(
      sourceRouteNodeId: $sourceRouteNodeId
      maxBirdFlyDistanceMeters: 2000
      maxHits: 10
      stops: [CENTRAL_OFFICE_SMALL]
      interests: [CABINET_SMALL, CONDUIT_CLOSURE_BRANCH_OFF]
    ) {
      id
      name
      distance
      routeNetworkSegmentIds
      routeNetworkSegmentGeometries
    }
  }
}`;

export type SpanEquipmentSpecification = {
  id: string;
  category: string;
  name: string;
  description: string;
  deprecated: boolean;
};

export type SpanEquipmentSpecificationsResponse = {
  utilityNetwork: {
    spanEquipmentSpecifications: SpanEquipmentSpecification[];
  };
};

export const SPAN_EQUIPMENT_SPEFICIATIONS_QUERY = `
query {
  utilityNetwork {
    spanEquipmentSpecifications {
      id
      category
      name
      description
      deprecated
    }
  }
}`;
