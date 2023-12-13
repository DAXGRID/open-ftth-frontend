import { MapboxGeoJSONFeature } from "maplibre-gl";
import ModalContainer from "../../../components/ModalContainer";
import AddContainer from "../AddContainer";
import AddInnerSpanStructure from "../AddInnerSpanStructure";
import EstablishCustomerConnection from "../EstablishCustomerConnection";
import AddRack from "../AddRack";
import AddTerminalEquipment from "../AddTerminalEquipment";
import OutageView from "../OutageView";
import ArrangeRackEquipment from "../ArrangeRackEquipment";

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
  selectedFeatures: MapboxGeoJSONFeature[],
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
  routeNodeId: string,
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
  selectedFeatures: MapboxGeoJSONFeature[],
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
  selectedFeatures: MapboxGeoJSONFeature[],
) {
  const freeRackSpace =
    selectedFeatures.find((x) => x.source === "FreeRackSpace") ?? null;

  if (freeRackSpace) {
    const rackId = freeRackSpace.properties?.rackId;

    if (!rackId) {
      throw Error(`Could not get the rack id on free rack space.`);
    }

    const position = freeRackSpace.properties?.position;
    if (!rackId) {
      throw Error(`Could not get the position on free rack space.`);
    }

    return (
      <ModalContainer title={title} closeCallback={cb}>
        <AddTerminalEquipment
          routeNodeId={routeNodeId}
          rackId={rackId as string}
          position={Number(position)}
        />
      </ModalContainer>
    );
  } else {
    return (
      <ModalContainer title={title} closeCallback={cb}>
        <AddTerminalEquipment routeNodeId={routeNodeId} />
      </ModalContainer>
    );
  }
}

export function outageViewModal(
  cb: () => void,
  title: string,
  routeElementId: string,
) {
  return (
    <ModalContainer title={title} closeCallback={cb}>
      <OutageView routeElementId={routeElementId} />
    </ModalContainer>
  );
}

export function arrangeRackEquipmentModal(
  cb: () => void,
  title: string,
  routeElementId: string,
  terminalEquipmentId: string,
) {
  return (
    <ModalContainer title={title} closeCallback={cb}>
      <ArrangeRackEquipment
        routeElementId={routeElementId}
        terminalEquipmentId={terminalEquipmentId}
      />
    </ModalContainer>
  );
}
