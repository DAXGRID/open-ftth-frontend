export interface SpanEquipmentSpecificationsResponse {
  utilityNetwork: UtilityNetwork;
}

interface UtilityNetwork {
  terminalEquipmentSpecifications: TerminalEquipmentSpecification[];
  manufacturers: Manufacturer[];
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

export const QUERY_TERMINAL_EQUIPMENT_SPECIFICATIONS = `
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
} `;

export interface RackResponse {
  utilityNetwork: {
    rack: Rack;
  };
}

export interface Rack {
  name: string;
}

export const QUERY_RACK = `
query (
  $routeNodeId: ID!,
  $rackId: ID!
) {
  utilityNetwork {
    rack(routeNodeId: $routeNodeId, rackId: $rackId) {
      name
    }
  }
}
`;

export interface PlaceTerminalEquipmentInNodeContainerResponse {
  nodeContainer: {
    placeTerminalEquipmentInNodeContainer: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

export type PlacementMethod = "TOP_DOWN" | "BOTTOM_UP";

export type NamingMethod = "NAME_AND_NUMBER" | "NAME_ONLY" | "NUMBER_ONLY";

export interface PlaceTerminalEquipmentInNodeContainerParams {
  routeNodeId: string;
  terminalEquipmentSpecificationId: string;
  manufacturerId: string | null;
  numberOfEquipments: number;
  startSequenceNumber: number;
  terminalEquipmentNamingMethod: NamingMethod;
  namingInfo: {
    name: string;
  };
  subrackPlacementInfo: {
    rackId: string;
    startUnitPosition: number;
    placementMethod: PlacementMethod;
  } | null;
  accessAddressId: string | null;
  unitAddressId: string | null;
  remark: string | null;
}

export const PLACE_TERMINAL_EQUIPMENT_IN_NODE_CONTAINER = `
mutation (
$routeNodeId: ID!
$terminalEquipmentSpecificationId: ID!
$manufacturerId: ID
$numberOfEquipments: Int!
$startSequenceNumber: Int!
$terminalEquipmentNamingMethod: TerminalEquipmentNamingMethodEnum!
$namingInfo: NamingInfoInputType!
$subrackPlacementInfo: SubrackPlacementInfoInputType
$accessAddressId: ID
$unitAddressId: ID
$remark: String
) {
  nodeContainer {
    placeTerminalEquipmentInNodeContainer(
      routeNodeId: $routeNodeId
      terminalEquipmentSpecificationId: $terminalEquipmentSpecificationId
      manufacturerId: $manufacturerId
      numberOfEquipments: $numberOfEquipments
      startSequenceNumber: $startSequenceNumber
      terminalEquipmentNamingMethod: $terminalEquipmentNamingMethod
      namingInfo: $namingInfo
      subrackPlacementInfo: $subrackPlacementInfo
      addressInfo: {
        accessAddressId: $accessAddressId
        unitAddressId: $unitAddressId
        remark: $remark
      }
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;

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

export interface NearestAccessAddressesResponse {
  addressService: {
    nearestAccessAddresses: NearestAccessAddress[];
  };
}

export const NEAREST_ACCESS_ADDRESSES_QUERY = `
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
