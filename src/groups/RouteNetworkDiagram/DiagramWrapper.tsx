import { useContext, useState, useEffect } from "react";
import { useSubscription, useClient } from "urql";
import { MapContext } from "../../contexts/MapContext";
import EditDiagram from "./EditDiagram";
import ReadOnlyDiagram from "./ReadOnlyDiagram";
import Loading from "../../components/Loading";
import { DiagramProvider } from "./DiagramContext";
import {
  GET_DIAGRAM,
  DiagramQueryResponse,
  Envelope,
  Diagram,
  SCHEMATIC_DIAGRAM_UPDATED,
  DiagramUpdatedResponse,
} from "./DiagramWrapperGql";

type DiagramWrapperProps = {
  editable: boolean;
};

function DiagramWrapper({ editable }: DiagramWrapperProps) {
  const client = useClient();
  const { identifiedFeature } = useContext(MapContext);
  const [diagramObjects, setDiagramObjects] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(false);
  const [envelope, setEnvelope] = useState<Envelope>({
    maxX: 0,
    maxY: 0,
    minX: 0,
    minY: 0,
  });

  const [diagramSubscriptionResult] = useSubscription<DiagramUpdatedResponse>({
    query: SCHEMATIC_DIAGRAM_UPDATED,
    variables: { routeNetworkElementId: identifiedFeature?.id },
    pause: !identifiedFeature?.id,
  });

  useEffect(() => {
    if (!identifiedFeature?.id || !client) return;
    setLoading(true);

    client
      .query<DiagramQueryResponse>(GET_DIAGRAM, {
        routeNetworkElementId: identifiedFeature.id,
      })
      .toPromise()
      .then((r) => {
        if (r.data) {
          const { diagramObjects, envelope } = r.data.schematic.buildDiagram;
          setDiagramObjects(diagramObjects);
          setEnvelope(envelope);
        } else {
          console.error("Could not load diagram.");
        }
        setLoading(false);
      });
  }, [identifiedFeature?.id, client]);

  useEffect(() => {
    if (!diagramSubscriptionResult?.data) return;

    const { diagramObjects, envelope } =
      diagramSubscriptionResult.data.schematicDiagramUpdated;

    setDiagramObjects([...diagramObjects]);
    setEnvelope({ ...envelope });
  }, [diagramSubscriptionResult]);

  if (loading) return <Loading />;
  if (!identifiedFeature?.id) return <></>;

  return (
    <div className="diagram-wrapper">
      {editable && (
        <EditDiagram diagramObjects={diagramObjects} envelope={envelope} />
      )}
      {!editable && (
        <ReadOnlyDiagram diagramObjects={diagramObjects} envelope={envelope} />
      )}
    </div>
  );
}

interface DiagramContextWrapperProps {
  editable: boolean;
}

function DiagramContextWrapper({ editable }: DiagramContextWrapperProps) {
  return (
    <DiagramProvider>
      <DiagramWrapper editable={editable} />
    </DiagramProvider>
  );
}

export default DiagramContextWrapper;
