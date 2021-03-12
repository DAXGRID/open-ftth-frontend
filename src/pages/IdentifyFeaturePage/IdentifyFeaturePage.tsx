import { useEffect, useState, useContext } from "react";
import { useQuery, useSubscription } from "urql";
import DiagramMenu from "../../components/DiagramMenu";
import ModalContainer from "../../components/ModalContainer";
import SchematicDiagram from "../../components/SchematicDiagram";
import ToggleButton from "../../components/ToggleButton";
import ActionButton from "../../components/ActionButton";
import Loading from "../../components/Loading";
import { MapContext } from "../../contexts/MapContext";
import {
  Diagram,
  DiagramQueryResponse,
  DiagramUpdatedResponse,
  Envelope,
  GET_DIAGRAM_QUERY,
  SCHEMATIC_DIAGRAM_UPDATED,
} from "./IdentifyFeatureGql";
import AddContainer from "./AddContainer";

import CutConduitSvg from "../../assets/cut-conduit.svg";
import PencilSvg from "../../assets/pencil.svg";
import PlusSvg from "../../assets/plus.svg";
import DisconnectSvg from "../../assets/disconnect.svg";
import ConnectSvg from "../../assets/connect.svg";
import PutInContainerSvg from "../../assets/put-in-container.svg";
import RemoveFromContainerSvg from "../../assets/remove-from-container.svg";

function IdentifyFeaturePage() {
  const [showAddContainer, setShowAddContainer] = useState(false);
  const { identifiedFeature } = useContext(MapContext);
  const [diagramObjects, setDiagramObjects] = useState<Diagram[]>([]);
  const [envelope, setEnvelope] = useState<Envelope>({
    maxX: 0,
    maxY: 0,
    minX: 0,
    minY: 0,
  });

  const [spanEquipmentResult] = useQuery<DiagramQueryResponse>({
    requestPolicy: "cache-and-network",
    query: GET_DIAGRAM_QUERY,
    variables: {
      routeNetworkElementId: identifiedFeature?.id,
    },
  });

  const [res] = useSubscription<DiagramUpdatedResponse>({
    query: SCHEMATIC_DIAGRAM_UPDATED,
    variables: { routeNetworkElementId: identifiedFeature?.id },
  });

  useEffect(() => {
    if (!spanEquipmentResult.data) return;

    const {
      diagramObjects,
      envelope,
    } = spanEquipmentResult.data.schematic.buildDiagram;

    setDiagramObjects([...diagramObjects]);
    setEnvelope({ ...envelope });
  }, [spanEquipmentResult, setDiagramObjects, setEnvelope]);

  useEffect(() => {
    if (!res.data) return;

    const { diagramObjects, envelope } = res.data.schematicDiagramUpdated;

    setDiagramObjects([...diagramObjects]);
    setEnvelope({ ...envelope });
  }, [res, setDiagramObjects, setEnvelope]);

  if (spanEquipmentResult.fetching || !identifiedFeature?.id) {
    return <Loading />;
  }

  return (
    <div className="identify-feature-page">
      <ModalContainer
        show={showAddContainer}
        closeCallback={() => setShowAddContainer(false)}
      >
        <AddContainer />
      </ModalContainer>
      <DiagramMenu>
        <ToggleButton
          icon={PencilSvg}
          toggled={false}
          toggle={(x) => console.log(x)}
          id="Edit"
          title="Edit mode"
        />
        <ActionButton
          icon={CutConduitSvg}
          action={() => {}}
          title="Cut conduit"
        />
        <ActionButton
          icon={DisconnectSvg}
          action={() => {}}
          title="Disconnect conduit"
        />
        <ActionButton
          icon={ConnectSvg}
          action={() => {}}
          title="Connect conduit"
        />
        <ActionButton
          icon={PutInContainerSvg}
          action={() => {}}
          title="Attach"
        />
        <ActionButton
          icon={RemoveFromContainerSvg}
          action={() => {}}
          title="De-attach"
        />
        <ActionButton
          icon={PlusSvg}
          action={() => setShowAddContainer(true)}
          title="Add node container"
        />
      </DiagramMenu>
      <SchematicDiagram diagramObjects={diagramObjects} envelope={envelope} />
    </div>
  );
}

export default IdentifyFeaturePage;
