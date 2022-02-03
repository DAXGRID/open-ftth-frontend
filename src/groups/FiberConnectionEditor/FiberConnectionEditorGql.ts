import { Client } from "urql";

export type ConnectivityFace = {
  faceKind: string;
  faceName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentKind: string;
};

export type EquipmentConnectivityFacesResponse = {
  utilityNetwork: {
    connectivityFaces: ConnectivityFace[];
  };
};

export type ConnectivityFaceConnection = {
  terminalOrSegmentId: string;
  name: string;
  endInfo: string;
  isConnected: boolean;
};

export type ConnectivityFaceConnectionResponse = {
  utilityNetwork: {
    connectivityFaceConnections: ConnectivityFaceConnection[];
  };
};

export function getConnectivityFaceConnections(
  client: Client,
  {
    faceType,
    routeNodeId,
    spanOrTerminalEquipmentId,
  }: ConnectivityFaceConnectionsParams
) {
  return client
    .query<ConnectivityFaceConnectionResponse>(
      CONNECTIVITY_FACE_CONNECTIONS_QUERY,
      {
        faceType: faceType,
        routeNodeId,
        spanOrTerminalEquipmentId,
      } as ConnectivityFaceConnectionsParams
    )
    .toPromise();
}

export function getConnectivityFacesData(client: Client, routeNodeId: string) {
  return client
    .query<EquipmentConnectivityFacesResponse>(CONNECTIVITY_FACES_QUERY, {
      routeNodeId: routeNodeId,
    } as ConnectivityFacesQueryParams)
    .toPromise();
}

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
      faceType: $faceType
    )
    {
      terminalOrSegmentId
      name
      endInfo
      isConnected
    }
  }
}
`;
