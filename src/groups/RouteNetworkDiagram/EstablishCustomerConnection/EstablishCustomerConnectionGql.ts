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

export type NearestAccessAddressResponse = {
  adressService: {
    nearestAccessAddresses: AccessAddress[];
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
        houseHumber
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
