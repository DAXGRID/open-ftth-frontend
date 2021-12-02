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

export const QUERY_TERMINAL_EQUIPMENT = `
query {
  utilityNetwork {
    terminalEquipmentSpecifications {
      id
      name
      category
      isRackEquipment
      description
      manufacturerRefs
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

export interface PlaceTerminalEquipmentInNodeContainerParams {
  nodeContainerId: string;
  terminalEquipmentSpecificationId: string;
  numberofEquipments: number;
  startSequenceNumber: number;
  terminalEquipmentNamingMethod: "NAME_AND_NUMBER";
  namingInfo: {
    name: string;
  };
  subrackPlacementInfo: {
    rackId: string;
    startUnitPosition: number;
    placementMethod: "TOP_DOWN";
  };
}

export const PLACE_TERMINAL_EQUIPMENT_IN_NODE_CONTAINER = `
mutation (
$nodeContainerId: ID
) {
  nodeContainer {
    placeTerminalEquipmentInNodeContainer(
      nodeContainerId: ""
      terminalEquipmentSpecificationId: ""
      numberOfEquipments: 2
      startSequenceNumber: 10
      terminalEquipmentNamingMethod: NAME_AND_NUMBER
      namingInfo: { name: "Kassette" }
      subrackPlacementInfo: {
        rackId: ""
        startUnitPosition: 0
        placmentMethod: TOP_DOWN
      }
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
