import { Client } from "urql";

export function placeTerminalEquipmentInNodeContainer(
  client: Client,
  param: PlaceTerminalEquipmentInNodeContainerParams,
) {
  return client
    .mutation<PlaceTerminalEquipmentInNodeContainerResponse>(
      PLACE_TERMINAL_EQUIPMENT_IN_NODE_CONTAINER,
      param,
    )
    .toPromise();
}

export function getNearestUndocumentedInstallations(
  client: Client,
  param: NearestUndocumentedInstallationsParams,
) {
  return client
    .query<NearestUndocumentedInstallationsResponse>(
      NEAREST_UNDOCUMENTED_INSTALLATIONS,
      param,
    )
    .toPromise();
}

export function getTerminalSpecifications(client: Client) {
  return client
    .query<SpanEquipmentSpecificationsResponse>(
      QUERY_TERMINAL_EQUIPMENT_SPECIFICATIONS,
    )
    .toPromise();
}

export interface Installation {
  installationId: string;
  displayAddress: string;
  additionalAddressInformation: string;
  distance: number;
}

interface NearestUndocumentedInstallationsResponse {
  installation: {
    nearestUndocumentedInstallations: Installation[];
  };
}

interface NearestUndocumentedInstallationsParams {
  routeNodeId: string;
  maxHits: number;
  searchRadiusMeter: number;
}

const NEAREST_UNDOCUMENTED_INSTALLATIONS = `
query($routeNodeId: ID!, $maxHits: Int!, $searchRadiusMeter: Int!) {
  installation {
    nearestUndocumentedInstallations(
      routeNodeId: $routeNodeId
      maxHits: $maxHits
      searchRadiusMeter: $searchRadiusMeter) {
        installationId
        displayAddress
        additionalAddressInformation
        distance
    }
  }
}
`;

interface SpanEquipmentSpecificationsResponse {
  utilityNetwork: {
    terminalEquipmentSpecifications: TerminalEquipmentSpecification[];
  };
}

interface TerminalEquipmentSpecification {
  id: string;
  name: string;
  isCustomerTermination: boolean;
}

const QUERY_TERMINAL_EQUIPMENT_SPECIFICATIONS = `
query {
  utilityNetwork {
    terminalEquipmentSpecifications {
      id
      name
      isCustomerTermination
    }
  }
}`;

interface PlaceTerminalEquipmentInNodeContainerResponse {
  nodeContainer: {
    placeTerminalEquipmentInNodeContainer: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

type PlacementMethod = "TOP_DOWN" | "BOTTOM_UP";
type NamingMethod = "NAME_AND_NUMBER" | "NAME_ONLY" | "NUMBER_ONLY";

interface PlaceTerminalEquipmentInNodeContainerParams {
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

const PLACE_TERMINAL_EQUIPMENT_IN_NODE_CONTAINER = `
mutation (
$routeNodeId: ID!
$terminalEquipmentSpecificationId: ID!
$manufacturerId: ID
$numberOfEquipments: Int!
$startSequenceNumber: Int!
$terminalEquipmentNamingMethod: TerminalEquipmentNamingMethodEnum!
$namingInfo: NamingInfoInput!
$subrackPlacementInfo: SubrackPlacementInfoInput
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
