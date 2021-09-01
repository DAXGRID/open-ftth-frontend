export type UnitAddress = {
  id: string;
  floorName: string;
  suitName: string;
};

export type AccessAddress = {
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
        }
      }
    }
  }
}`;
