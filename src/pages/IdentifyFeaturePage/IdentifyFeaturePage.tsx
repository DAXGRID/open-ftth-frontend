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

import CutConduit from "../../assets/cut-conduit.svg";
import Pencil from "../../assets/pencil.svg";
import Plus from "../../assets/plus.svg";
import Disconnect from "../../assets/disconnect.svg";
import Connect from "../../assets/connect.svg";
import PutInContainer from "../../assets/put-in-container.svg";
import RemoveFromContainer from "../../assets/remove-from-container.svg";
import Minus from "../../assets/minus.svg";

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
          icon={Pencil}
          toggled={false}
          toggle={(x) => console.log(x)}
          id="Edit"
          title="Edit mode"
        />
        <ActionButton icon={CutConduit} action={() => {}} title="Cut" />
        <ActionButton icon={Disconnect} action={() => {}} title="Cut" />
        <ActionButton icon={Connect} action={() => {}} title="Cut" />
        <ActionButton icon={PutInContainer} action={() => {}} title="Cut" />
        <ActionButton
          icon={RemoveFromContainer}
          action={() => {}}
          title="Cut"
        />
        <ActionButton icon={Minus} action={() => {}} title="Cut" />
        <ActionButton
          icon={Plus}
          action={() => setShowAddContainer(true)}
          title="Add node container"
        />
      </DiagramMenu>
      <SchematicDiagram diagramObjects={diagramObjects} envelope={envelope} />
    </div>
  );
}

export default IdentifyFeaturePage;
