import { Client } from "urql";

interface QueryTerminalEquipmentDetailsParams {
  terminalEquipmentOrTerminalId: string;
}

export function queryTerminalEquipmentDetails(
  client: Client,
  terminalEquipmentId: string
) {
  return client
    .query<QueryTerminalEquipmentDetailsResponse>(
      QUERY_TERMINAL_EQUIPMENT_DETAILS,
      {
        terminalEquipmentOrTerminalId: terminalEquipmentId,
      } as QueryTerminalEquipmentDetailsParams
    )
    .toPromise();
}

export function queryTerminalEquipmentSpecifications(client: Client) {
  return client
    .query<SpanEquipmentSpecificationsResponse>(
      QUERY_TERMINAL_EQUIPMENT_SPECIFICATIONS
    )
    .toPromise();
}

export function queryNearestAccessAddresses(
  client: Client,
  routeNodeId: string
) {
  return client
    .query<QueryNearestAccessAddressesResponse>(
      QUERY_NEAREST_ACCESS_ADDRESSES,
      {
        routeNodeId: routeNodeId,
      } as QueryNearestAccessAddressesParams
    )
    .toPromise();
}

export interface TerminalEquipment {
  id: string;
  name: string;
  description?: string;
  specification: {
    category: string;
    id: string;
    isRackEquipment: boolean;
    isAddressable: boolean;
  };
  manufacturer?: {
    id: string;
  };
  addressInfo?: {
    remark: string;
    accessAddress: {
      id: string;
    };
    unitAddress: {
      id: string;
    };
  };
}

interface QueryTerminalEquipmentDetailsResponse {
  utilityNetwork: {
    terminalEquipment: TerminalEquipment;
  };
}

const QUERY_TERMINAL_EQUIPMENT_DETAILS = `
query ($terminalEquipmentOrTerminalId: ID!) {
  utilityNetwork {
    terminalEquipment(terminalEquipmentOrTerminalId: $terminalEquipmentOrTerminalId) {
      id
      name
      description
      specification {
        category
        id
        isRackEquipment
        isAddressable
      }
      manufacturer {
        id
      }
      addressInfo {
        remark
        accessAddress {
          id
        }
        unitAddress {
          id
        }
      }
    }
  }
}
`;

export interface SpanEquipmentSpecificationsResponse {
  utilityNetwork: {
    terminalEquipmentSpecifications: TerminalEquipmentSpecification[];
    manufacturers: Manufacturer[];
  };
}

export interface TerminalEquipmentSpecification {
  id: string;
  name: string;
  category: string;
  isRackEquipment: boolean;
  manufacturerRefs: string[];
  isAddressable: boolean;
}

export interface Manufacturer {
  id: string;
  name: string;
  description: string;
  deprecated: boolean;
}

export interface Rack {
  name: string;
}

const QUERY_TERMINAL_EQUIPMENT_SPECIFICATIONS = `
query {
  utilityNetwork {
    terminalEquipmentSpecifications {
      id
      name
      category
      isRackEquipment
      description
      manufacturerRefs
      isAddressable
    },
    manufacturers {
      id
      name
      description
      deprecated
    }
  }
}`;

export interface UnitAddress {
  id: string;
  floorName: string;
  suitName: string;
  externalId: string;
}

interface AccessAddress {
  id: string;
  roadName: string;
  houseNumber: string;
  townName: string;
  postDistrict: string;
  unitAddresses: UnitAddress[];
}

export interface NearestAccessAddress {
  distance: number;
  accessAddress: AccessAddress;
}

interface QueryNearestAccessAddressesResponse {
  addressService: {
    nearestAccessAddresses: NearestAccessAddress[];
  };
}

interface QueryNearestAccessAddressesParams {
  routeNodeId: string;
}

const QUERY_NEAREST_ACCESS_ADDRESSES = `
query($routeNodeId: ID!) {
  addressService {
    nearestAccessAddresses(routeNodeId: $routeNodeId, maxHits: 100) {
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
