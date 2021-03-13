import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useQuery, useSubscription, useMutation } from "urql";
import { MapboxGeoJSONFeature } from "mapbox-gl";
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
  GET_DIAGRAM,
  SCHEMATIC_DIAGRAM_UPDATED,
  AFFIX_SPAN_EQUIPMENT_TO_NODE_CONTAINER,
  AffixSpanEquipmentParams,
  AffixSpanEquipmentResponse,
  CUT_SPAN_SEGMENTS,
  CutSpanSegmentsParameter,
  CutSpanSegmentsResponse,
  CONNECT_SPAN_SEGMENTS,
  ConnectSpanSegmentsParameter,
  ConnectSpanSegmentsResponse,
  DISCONNECT_SPAN_SEGMENTS,
  DisconnectSpanSegmentsParameter,
  DisconnectSpanSegmentsResponse,
  DETACH_SPAN_EQUIPMENT_FROM_NODE_CONTAINER,
  DetachSpanEquipmentParameters,
  DetachSpanEquipmentResponse,
} from "./IdentifyFeatureGql";
import AddContainer from "./AddContainer";

import CutConduitSvg from "../../assets/cut-conduit.svg";
import PencilSvg from "../../assets/pencil.svg";
import PlusSvg from "../../assets/plus.svg";
import DisconnectSvg from "../../assets/disconnect.svg";
import ConnectSvg from "../../assets/connect.svg";
import PutInContainerSvg from "../../assets/put-in-container.svg";
import RemoveFromContainerSvg from "../../assets/remove-from-container.svg";
import { toast } from "react-toastify";

function IdentifyFeaturePage() {
  const selectedFeatures = useRef<MapboxGeoJSONFeature[]>([]);
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
    query: GET_DIAGRAM,
    variables: {
      routeNetworkElementId: identifiedFeature?.id,
    },
    pause: !identifiedFeature?.id,
  });

  const [, cutSpanSegmentsMutation] = useMutation<CutSpanSegmentsResponse>(
    CUT_SPAN_SEGMENTS
  );

  const [
    ,
    affixSpanEquipmentMutation,
  ] = useMutation<AffixSpanEquipmentResponse>(
    AFFIX_SPAN_EQUIPMENT_TO_NODE_CONTAINER
  );

  const [
    ,
    connectSpanSegmentsMutation,
  ] = useMutation<ConnectSpanSegmentsResponse>(CONNECT_SPAN_SEGMENTS);

  const [
    ,
    disconnectSpanSegmentsMutation,
  ] = useMutation<DisconnectSpanSegmentsResponse>(DISCONNECT_SPAN_SEGMENTS);

  const [
    ,
    detachSpanEquipmentMutation,
  ] = useMutation<DetachSpanEquipmentResponse>(
    DETACH_SPAN_EQUIPMENT_FROM_NODE_CONTAINER
  );

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

  const affixSpanEquipment = async () => {
    const nodeContainer = selectedFeatures.current.find(
      (x) => x.layer.source === "NodeContainerSide"
    );

    const nodeContainerId = nodeContainer?.properties?.refId as string;

    const spanSegmentId = selectedFeatures.current.find(
      (x) => x.layer.source === "OuterConduit"
    )?.properties?.refId as string;

    if (!nodeContainerId) {
      toast.error("No node container selected");
      return;
    }
    if (!spanSegmentId) {
      toast.error("No segment selected");
      return;
    }

    let nodeContainerSide = nodeContainer?.properties?.type as string;

    if (nodeContainerSide.includes("North")) nodeContainerSide = "NORTH";
    else if (nodeContainerSide.includes("West")) nodeContainerSide = "WEST";
    else if (nodeContainerSide.includes("East")) nodeContainerSide = "EAST";
    else if (nodeContainerSide.includes("South")) nodeContainerSide = "SOUTH";
    else toast.error(`${nodeContainerSide} is not valid`);

    const parameters: AffixSpanEquipmentParams = {
      nodeContainerId: nodeContainerId,
      nodeContainerSide: nodeContainerSide as
        | "NORTH"
        | "WEST"
        | "EAST"
        | "SOUTH",
      spanSegmentId: spanSegmentId,
    };

    const { data } = await affixSpanEquipmentMutation(parameters);
    if (data?.spanEquipment.affixSpanEquipmentToNodeContainer.isSuccess) {
      toast.success("Affix span equipment successful");
      selectedFeatures.current = [];
    } else {
      toast.error(
        data?.spanEquipment.affixSpanEquipmentToNodeContainer.errorCode
      );
    }

    selectedFeatures.current = [];
  };

  const cutSpanSegments = async () => {
    const spanSegmentsToCut = selectedFeatures.current
      .filter((x) => {
        return (
          x.layer.source === "InnerConduit" || x.layer.source === "OuterConduit"
        );
      })
      .map((x) => x.properties?.refId as string);

    if (!identifiedFeature?.id) {
      toast.error("No identified feature");
      return;
    }

    const parameters: CutSpanSegmentsParameter = {
      routeNodeId: identifiedFeature.id,
      spanSegmentsToCut: spanSegmentsToCut,
    };

    const { data } = await cutSpanSegmentsMutation(parameters);
    if (data?.spanEquipment.cutSpanSegments.isSuccess) {
      toast.success("Span segments successfully cut");
      selectedFeatures.current = [];
    } else {
      toast.error(data?.spanEquipment.cutSpanSegments.errorCode);
    }
  };

  const connectSpanSegments = async () => {
    const spanSegmentsToConnect = selectedFeatures.current
      .filter((x) => {
        return x.layer.source === "InnerConduit";
      })
      .map((x) => x.properties?.refId as string);

    if (!identifiedFeature?.id) {
      toast.error("No identified feature");
      return;
    }

    const parameters: ConnectSpanSegmentsParameter = {
      routeNodeId: identifiedFeature.id,
      spanSegmentsToConnect: spanSegmentsToConnect,
    };

    const { data } = await connectSpanSegmentsMutation(parameters);
    if (data?.spanEquipment.connectSpanSegments.isSuccess) {
      toast.success("Span segments successfully connected");
      selectedFeatures.current = [];
    } else {
      toast.error(data?.spanEquipment.connectSpanSegments.errorCode);
    }
  };

  const disconnectSpanSegments = async () => {
    const spanSegmentsToDisconnect = selectedFeatures.current
      .filter((x) => {
        return x.layer.source === "InnerConduit";
      })
      .map((x) => x.properties?.refId as string);

    if (!identifiedFeature?.id) {
      toast.error("No identified feature");
      return;
    }

    const parameters: DisconnectSpanSegmentsParameter = {
      routeNodeId: identifiedFeature.id,
      spanSegmentsToDisconnect: spanSegmentsToDisconnect,
    };

    const { data } = await disconnectSpanSegmentsMutation(parameters);
    if (data?.spanEquipment.disconnectSpanSegments.isSuccess) {
      toast.success("Span segments successfully disconnected");
      selectedFeatures.current = [];
    } else {
      toast.error(data?.spanEquipment.disconnectSpanSegments.errorCode);
    }
  };

  const detachSpanEquipment = async () => {
    const spanSegmentToDetach = selectedFeatures.current
      .filter((x) => {
        return (
          x.layer.source === "InnerConduit" || x.layer.source === "OuterConduit"
        );
      })
      .map((x) => x.properties?.refId as string);

    if (spanSegmentToDetach.length === 0) {
      toast.error("No span segments selected");
    }

    if (!identifiedFeature?.id) {
      toast.error("No identified feature");
      return;
    }

    const parameters: DetachSpanEquipmentParameters = {
      spanSegmentId: identifiedFeature.id,
      routeNodeId: spanSegmentToDetach[0],
    };

    const { data } = await detachSpanEquipmentMutation(parameters);
    if (data?.spanEquipment.detachSpanEquipmentFromNodeContainer.isSuccess) {
      toast.success("Span segments successfully disconnected");
      selectedFeatures.current = [];
    } else {
      toast.error(
        data?.spanEquipment.detachSpanEquipmentFromNodeContainer.errorCode
      );
    }
  };

  const onSelectedFeature = useCallback((feature: MapboxGeoJSONFeature) => {
    const isSelected = feature.state?.selected as boolean;

    if (isSelected) {
      selectedFeatures.current = [...selectedFeatures.current, feature];
    } else {
      selectedFeatures.current = selectedFeatures.current.filter((x) => {
        return x.properties?.refId !== feature.properties?.refId;
      });
    }
  }, []);

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
      {identifiedFeature.type === "RouteNode" && (
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
            action={() => cutSpanSegments()}
            title="Cut conduit"
          />
          <ActionButton
            icon={DisconnectSvg}
            action={() => disconnectSpanSegments()}
            title="Disconnect conduit"
          />
          <ActionButton
            icon={ConnectSvg}
            action={() => {
              connectSpanSegments();
            }}
            title="Connect conduit"
          />
          <ActionButton
            icon={PutInContainerSvg}
            action={() => affixSpanEquipment()}
            title="Attach"
          />
          <ActionButton
            icon={RemoveFromContainerSvg}
            action={() => detachSpanEquipment()}
            title="De-attach"
          />
          <ActionButton
            icon={PlusSvg}
            action={() => setShowAddContainer(true)}
            title="Add node container"
          />
        </DiagramMenu>
      )}
      <SchematicDiagram
        diagramObjects={diagramObjects}
        envelope={envelope}
        onSelectFeature={onSelectedFeature}
      />
    </div>
  );
}

export default IdentifyFeaturePage;
