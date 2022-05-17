import { MapGeoJSONFeature } from "maplibre-gl";
import ModalContainer from "../../../components/ModalContainer";
import AddContainer from "../AddContainer";
import AddInnerSpanStructure from "../AddInnerSpanStructure";
import EstablishCustomerConnection from "../EstablishCustomerConnection";
import AddRack from "../AddRack";
import AddTerminalEquipment from "../AddTerminalEquipment";

export function addContainerModal(cb: () => void, title: string) {
  return (
    <ModalContainer closeCallback={cb} title={title}>
      <AddContainer />
    </ModalContainer>
  );
}

export function addInnerConduitModal(
  cb: () => void,
  title: string,
  selectedFeatures: MapGeoJSONFeature[]
) {
  return (
    <ModalContainer closeCallback={cb} title={title}>
      <AddInnerSpanStructure
        selectedOuterConduit={
          selectedFeatures.find((x) => x.source === "OuterConduit")?.properties
            ?.refId ?? ""
        }
      />
    </ModalContainer>
  );
}

export function establishCustomerConnectionModal(
  cb: () => void,
  title: string,
  routeNodeId: string
) {
  return (
    <ModalContainer closeCallback={cb} title={title}>
      <EstablishCustomerConnection routeNodeId={routeNodeId} load={true} />
    </ModalContainer>
  );
}

export function addRackModal(
  cb: () => void,
  title: string,
  selectedFeatures: MapGeoJSONFeature[]
) {
  return (
    <ModalContainer title={title} closeCallback={cb}>
      <AddRack
        nodeContainerId={
          selectedFeatures.find((x) => x.source === "NodeContainer")?.properties
            ?.refId ?? ""
        }
      />
    </ModalContainer>
  );
}

export function addTerminalEquipmentModal(
  cb: () => void,
  title: string,
  routeNodeId: string,
  selectedFeatures: MapGeoJSONFeature[]
) {
  return (
    <ModalContainer title={title} closeCallback={cb}>
      <AddTerminalEquipment
        routeNodeId={routeNodeId}
        rackId={
          selectedFeatures.find((x) => x.source === "Rack")?.properties
            ?.refId ?? ""
        }
      />
    </ModalContainer>
  );
}
