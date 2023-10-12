import { useContext, useState, useEffect } from "react";
import { useSubscription, useClient } from "urql";
import { MapContext } from "../../contexts/MapContext";
import EditDiagram from "./EditDiagram";
import ReadOnlyDiagram from "./ReadOnlyDiagram";
import Loading from "../../components/Loading";
import { DiagramProvider } from "./DiagramContext";
import { useLocation, useHistory } from "react-router-dom";
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

interface LocationParameters {
  type: string | null;
  id: string | null;
}

function getUrlParameters(parametersString: string): LocationParameters {
  const params = new URLSearchParams(parametersString);

  const newParams = new URLSearchParams();
  for (const [name, value] of params) {
    newParams.append(name.toLowerCase(), value);
  }

  return {
    type: newParams.get("type"),
    id: newParams.get("id"),
  };
}

function DiagramWrapper({ editable }: DiagramWrapperProps) {
  const client = useClient();
  const location = useLocation();
  const history = useHistory();

  const { identifiedFeature, setIdentifiedFeature } = useContext(MapContext);
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

  // Makes it possible to use the browser history to go back and forwards between equipment.
  useEffect(() => {
    const { id, type } = getUrlParameters(location.search);

    if (type !== null && id !== null) {
      setIdentifiedFeature({
        id: id,
        type: type as "RouteNode" | "RouteSegment",
      });
    }
  }, [setIdentifiedFeature, location.search]);

  useEffect(() => {
    if (
      !identifiedFeature ||
      !identifiedFeature.id ||
      !identifiedFeature.type
    ) {
      return;
    }

    const params = new URLSearchParams({
      id: identifiedFeature.id,
      type: identifiedFeature.type,
    });

    const oldPath = `${history.location.pathname}${history.location.search}`;
    const newPath = `${history.location.pathname}?${params}`;

    if (oldPath !== newPath) {
      history.push(newPath);
    }
  }, [identifiedFeature, history]);

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
