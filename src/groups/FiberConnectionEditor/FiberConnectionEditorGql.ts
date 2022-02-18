import { Client } from "urql";

export function getConnectivityFaceConnections(
  client: Client,
  {
    faceType,
    routeNodeId,
    spanOrTerminalEquipmentId,
  }: ConnectivityFaceConnectionsParams
) {
  return client
    .query<ConnectivityFaceConnectionsResponse>(
      CONNECTIVITY_FACE_CONNECTIONS_QUERY,
      {
        faceType: faceType,
        routeNodeId,
        spanOrTerminalEquipmentId,
      } as ConnectivityFaceConnectionsParams
    )
    .toPromise();
}

export function getConnectivityFaces(client: Client, routeNodeId: string) {
  return client
    .query<ConnectivityFacesResponse>(CONNECTIVITY_FACES_QUERY, {
      routeNodeId: routeNodeId,
    } as ConnectivityFacesQueryParams)
    .toPromise();
}

export function connectToTerminalEquipment(
  client: Client,
  { routeNodeId, connects }: ConnectToTerminalEquipmentParams
) {
  return client
    .mutation<ConnectToTerminalEquipmentResponse>(
      CONNECT_TO_TERMINAL_EQUIPMENT_MUTATION,
      {
        routeNodeId,
        connects,
      } as ConnectToTerminalEquipmentParams
    )
    .toPromise();
}

export type ConnectivityFaceConnection = {
  terminalOrSegmentId: string;
  name: string;
  endInfo: string;
  isConnected: boolean;
};

export type ConnectivityFacesResponse = {
  utilityNetwork: {
    connectivityFaces: ConnectivityFace[];
  };
};

interface ConnectivityFacesQueryParams {
  routeNodeId: string;
}

const CONNECTIVITY_FACES_QUERY = `
query ($routeNodeId: ID!) {
  utilityNetwork {
    connectivityFaces(routeNodeId: $routeNodeId) {
	  faceKind
      faceName
      equipmentId
      equipmentKind
      equipmentName
    }
  }
}
`;

export type ConnectivityFace = {
  faceKind: string;
  faceName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentKind: string;
};

export type ConnectivityFaceConnectionsResponse = {
  utilityNetwork: {
    connectivityFaceConnections: ConnectivityFaceConnection[];
  };
};

interface ConnectivityFaceConnectionsParams {
  routeNodeId: string;
  spanOrTerminalEquipmentId: string;
  faceType: string;
}

const CONNECTIVITY_FACE_CONNECTIONS_QUERY = `
query (
$routeNodeId: ID!,
$spanOrTerminalEquipmentId: ID!,
$faceType: FaceKindEnumType!) {
  utilityNetwork {
    connectivityFaceConnections (
      routeNodeId: $routeNodeId
      spanOrTerminalEquipmentId: $spanOrTerminalEquipmentId
      faceType: $faceType)
    {
      terminalOrSegmentId
      name
      endInfo
      isConnected
    }
  }
}
`;

interface ConnectToTerminalEquipmentResponse {
  spanEquipment: {
    connectToTerminalEquipment: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

interface ConnectToTerminalEquipmentParams {
  routeNodeId: string;
  connects: {
    spanSegmentId: string;
    terminalId: string;
  }[];
}

export const CONNECT_TO_TERMINAL_EQUIPMENT_MUTATION = `
mutation (
$routeNodeId: ID!,
$connects: [ConnectSpanSegmentToTerminalOperationInputType!]!) {
  spanEquipment {
    connectToTerminalEquipment (
      routeNodeId: $routeNodeId
      connects: $connects)
    {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
