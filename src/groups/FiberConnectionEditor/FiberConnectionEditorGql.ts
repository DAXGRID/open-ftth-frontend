import equipmentConnectivityFacesData from "./equipment-connectivity-faces-query-result.json";

export type EquipmentConnectivityFace = {
  directionType: string;
  directionName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentKind: string;
};

export type EquipmentConnectivityFacesResponse = {
  equipmentConnectivityFaces: EquipmentConnectivityFace[];
};

export function getEquipmentConnectivityFacesData(): EquipmentConnectivityFacesResponse {
  return { equipmentConnectivityFaces: equipmentConnectivityFacesData };
}
