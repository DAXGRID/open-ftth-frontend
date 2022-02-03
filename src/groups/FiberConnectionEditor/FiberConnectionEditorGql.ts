import { Client } from "urql";
import tConnectivityFaceConnectionsData from "./terminal-equipment-connectivity-face-connections-query-result.json";
import sConnectivityFaceConnectionsData from "./span-equipment-connectivity-face-connections-query-result.json";

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
  id: string;
  name: string;
  endInfo: string;
  isConnected: boolean;
};

export type ConnectivityFaceConnectionResponse = {
  connectivityFaceConnections: ConnectivityFaceConnection[];
};

export function getTConnectivityFaceConnectionsData(): ConnectivityFaceConnectionResponse {
  return {
    connectivityFaceConnections: tConnectivityFaceConnectionsData,
  };
}

export function getSConnectivityFaceConnectionsData(): ConnectivityFaceConnectionResponse {
  return {
    connectivityFaceConnections: sConnectivityFaceConnectionsData,
  };
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
