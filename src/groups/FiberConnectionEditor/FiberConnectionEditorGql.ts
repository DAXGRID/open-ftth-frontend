import equipmentConnectivityFacesData from "./equipment-connectivity-faces-query-result.json";
import tConnectivityFaceConnectionsData from "./terminal-equipment-connectivity-face-connections-query-result.json";
import sConnectivityFaceConnectionsData from "./span-equipment-connectivity-face-connections-query-result.json";

export type ConnectivityFace = {
  directionType: string;
  directionName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentKind: string;
};

export type EquipmentConnectivityFacesResponse = {
  equipmentConnectivityFaces: ConnectivityFace[];
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

export function getConnectivityFacesData(): EquipmentConnectivityFacesResponse {
  return { equipmentConnectivityFaces: equipmentConnectivityFacesData };
}
