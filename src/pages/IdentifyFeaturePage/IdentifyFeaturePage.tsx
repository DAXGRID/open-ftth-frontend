import {
  faCut,
  faHighlighter,
  faSearchLocation,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useContext } from "react";
import { useQuery, useSubscription } from "urql";
import DiagramMenu from "../../components/DiagramMenu";
import SchematicDiagram from "../../components/SchematicDiagram";
import ToggleButton from "../../components/ToggleButton";
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
  const [toggleButtons, setToggleButtons] = useState([
    { icon: faCut, toggled: false, id: 1 },
    { icon: faSearchLocation, toggled: false, id: 2 },
    { icon: faHighlighter, toggled: false, id: 3 },
  ]);
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

  function toggle(buttonId: number) {
    setToggleButtons(
      toggleButtons.map((button) =>
        button.id === buttonId
          ? { ...button, toggled: !button.toggled }
          : button
      )
    );
  }

  if (spanEquipmentResult.fetching || !identifiedFeatureId) {
    return <Loading />;
  }

  return (
    <div className="identify-feature-page">
      <DiagramMenu>
        {toggleButtons.map((x) => (
          <ToggleButton
            key={x.id}
            icon={x.icon}
            toggled={x.toggled}
            toggle={toggle}
            id={x.id}
          />
        ))}
      </DiagramMenu>
      <SchematicDiagram diagramObjects={diagramObjects} envelope={envelope} />
    </div>
  );
}

export default IdentifyFeaturePage;
