import { faPen, faCut, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useContext } from "react";
import { useQuery, useSubscription } from "urql";
import DiagramMenu from "../../components/DiagramMenu";
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

function IdentifyFeaturePage() {
  const { identifiedFeatureId } = useContext(MapContext);
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
      routeNetworkElementId: identifiedFeatureId,
    },
  });

  const [res] = useSubscription<DiagramUpdatedResponse>({
    query: SCHEMATIC_DIAGRAM_UPDATED,
    variables: { routeNetworkElementId: identifiedFeatureId },
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

  if (spanEquipmentResult.fetching || !identifiedFeatureId) {
    return <Loading />;
  }

  return (
    <div className="identify-feature-page">
      <DiagramMenu>
        <ToggleButton
          icon={faPen}
          toggled={false}
          toggle={(x) => console.log(x)}
          id="Edit"
        />
        <ActionButton icon={faCut} action={() => {}} />
        <ActionButton icon={faPlus} action={() => {}} />
      </DiagramMenu>
      <SchematicDiagram diagramObjects={diagramObjects} envelope={envelope} />
    </div>
  );
}

export default IdentifyFeaturePage;
