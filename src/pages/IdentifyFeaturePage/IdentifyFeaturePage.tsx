import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useQuery, useSubscription, useMutation, useClient } from "urql";
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
  SPAN_SEGMENT_TRACE,
  SpanSegmentTraceResponse,
  QUERY_ROUTE_NETWORK_ELEMENT,
  QueryRouteNetworkElementResponse,
  REMOVE_SPAN_STRUCTURE,
  RemoveSpanStructureResponse,
} from "./IdentifyFeatureGql";
import AddContainer from "./AddContainer";
import AddInnerSpanStructure from "./AddInnerSpanStructure";
import { toast } from "react-toastify";
import useBridgeConnector from "../../bridge/useBridgeConnector";
import { useTranslation } from "react-i18next";

import {
  ConnectSvg,
  CutConduitSvg,
  DisconnectSvg,
  PencilSvg,
  PlusSvg,
  PutInContainerSvg,
  RemoveFromContainerSvg,
  TrashCanSvg,
} from "../../assets";

function IdentifyFeaturePage() {
  const client = useClient();
  const { t } = useTranslation();
  const { highlightFeatures } = useBridgeConnector();
  const [editMode, setEditMode] = useState(false);
  const selectedFeatures = useRef<MapboxGeoJSONFeature[]>([]);
  const [showAddContainer, setShowAddContainer] = useState(false);
  const [showHandleInnerConduit, setShowHandleInnerConduit] = useState(false);
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

  const [
    routeNetworkElementResponse,
  ] = useQuery<QueryRouteNetworkElementResponse>({
    requestPolicy: "cache-and-network",
    query: QUERY_ROUTE_NETWORK_ELEMENT,
    variables: {
      routeElementId: identifiedFeature?.id,
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
    setEditMode(false);
  }, [identifiedFeature, setEditMode]);

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
    setShowAddContainer(false);
  }, [res, setDiagramObjects, setEnvelope, setShowAddContainer]);

  const affixSpanEquipment = async () => {
    const nodeContainer = selectedFeatures.current.find(
      (x) => x.layer.source === "NodeContainerSide"
    );

    const nodeContainerId = nodeContainer?.properties?.refId as string;

    const spanSegmentId = selectedFeatures.current.find(
      (x) => x.layer.source === "OuterConduit"
    )?.properties?.refId as string;

    if (!nodeContainerId) {
      toast.error(t("No node container selected"));
      return;
    }
    if (!spanSegmentId) {
      toast.error(t("No span segment selected"));
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
      selectedFeatures.current = [];
    } else {
      toast.error(
        t(
          data?.spanEquipment.affixSpanEquipmentToNodeContainer.errorCode ??
            "Error has occured"
        )
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
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: CutSpanSegmentsParameter = {
      routeNodeId: identifiedFeature.id,
      spanSegmentsToCut: spanSegmentsToCut,
    };

    const { data } = await cutSpanSegmentsMutation(parameters);
    if (data?.spanEquipment.cutSpanSegments.isSuccess) {
      selectedFeatures.current = [];
    } else {
      toast.error(
        t(data?.spanEquipment.cutSpanSegments.errorCode ?? "Error has occured")
      );
    }
  };

  const connectSpanSegments = async () => {
    const spanSegmentsToConnect = selectedFeatures.current
      .filter((x) => {
        return x.layer.source === "InnerConduit";
      })
      .map((x) => x.properties?.refId as string);

    if (!identifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: ConnectSpanSegmentsParameter = {
      routeNodeId: identifiedFeature.id,
      spanSegmentsToConnect: spanSegmentsToConnect,
    };

    const { data } = await connectSpanSegmentsMutation(parameters);
    if (data?.spanEquipment.connectSpanSegments.isSuccess) {
      selectedFeatures.current = [];
    } else {
      toast.error(
        t(
          data?.spanEquipment.connectSpanSegments.errorCode ??
            "Error has occured"
        )
      );
    }
  };

  const disconnectSpanSegments = async () => {
    const spanSegmentsToDisconnect = selectedFeatures.current
      .filter((x) => {
        return x.layer.source === "InnerConduit";
      })
      .map((x) => x.properties?.refId as string);

    if (!identifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: DisconnectSpanSegmentsParameter = {
      routeNodeId: identifiedFeature.id,
      spanSegmentsToDisconnect: spanSegmentsToDisconnect,
    };

    const { data } = await disconnectSpanSegmentsMutation(parameters);
    if (data?.spanEquipment.disconnectSpanSegments.isSuccess) {
      selectedFeatures.current = [];
    } else {
      toast.error(
        t(
          data?.spanEquipment.disconnectSpanSegments.errorCode ??
            "Error has occured"
        )
      );
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
      toast.error(t("No span segments selected"));
      return;
    }

    if (!identifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: DetachSpanEquipmentParameters = {
      routeNodeId: identifiedFeature.id,
      spanSegmentId: spanSegmentToDetach[0],
    };

    const { data } = await detachSpanEquipmentMutation(parameters);
    if (data?.spanEquipment.detachSpanEquipmentFromNodeContainer.isSuccess) {
      selectedFeatures.current = [];
    } else {
      toast.error(
        t(
          data?.spanEquipment.detachSpanEquipmentFromNodeContainer.errorCode ??
            "Error has occurred"
        )
      );
    }
  };

  const removeSpanStructure = async () => {
    const spanSegmentsToRemove = selectedFeatures.current
      .filter((x) => {
        return x.layer.source === "OuterConduit" || "InnerConduit";
      })
      .map((x) => x.properties?.refId as string);

    if (spanSegmentsToRemove.length > 1) {
      toast.error(t("You can only delete one object at a time"));
      return;
    } else if (spanSegmentsToRemove.length === 0) {
      toast.error(t("No objects selected"));
      return;
    }

    const confirmed = window.confirm(
      t("Are you sure you want to delete the selected object?")
    );
    if (!confirmed) return;

    const response = await client
      .mutation<RemoveSpanStructureResponse>(REMOVE_SPAN_STRUCTURE, {
        spanSegmentId: spanSegmentsToRemove[0],
      })
      .toPromise();

    if (response.data?.spanEquipment.removeSpanStructure.isSuccess) {
      selectedFeatures.current = [];
    } else {
      toast.error(
        t(response.data?.spanEquipment.removeSpanStructure.errorCode ?? "")
      );
    }
  };

  const onSelectedFeature = useCallback(
    async (feature: MapboxGeoJSONFeature) => {
      const isSelected = feature.state?.selected as boolean;

      if (!editMode) {
        if (isSelected) {
          const response = await client
            .query<SpanSegmentTraceResponse>(SPAN_SEGMENT_TRACE, {
              spanSegmentId: feature.properties?.refId,
            })
            .toPromise();

          highlightFeatures(
            response.data?.utilityNetwork.spanSegmentTrace
              ?.routeNetworkSegmentIds ?? []
          );
        } else {
          highlightFeatures([]);
        }
      } else {
        if (isSelected) {
          selectedFeatures.current = [...selectedFeatures.current, feature];
        } else {
          selectedFeatures.current = selectedFeatures.current.filter((x) => {
            return x.properties?.refId !== feature.properties?.refId;
          });
        }
      }
    },
    [editMode, client, highlightFeatures]
  );

  if (spanEquipmentResult.fetching || !identifiedFeature?.id) {
    return <Loading />;
  }

  return (
    <div className="identify-feature-page">
      <ModalContainer
        show={showAddContainer}
        closeCallback={() => {
          setShowAddContainer(false);
          selectedFeatures.current = [];
        }}
      >
        <AddContainer />
      </ModalContainer>

      <ModalContainer
        show={showHandleInnerConduit}
        closeCallback={() => {
          setShowHandleInnerConduit(false);
          selectedFeatures.current = [];
        }}
      >
        <AddInnerSpanStructure
          selectedOuterConduit={
            selectedFeatures.current.find((x) => x.source === "OuterConduit")
              ?.properties?.refId ?? ""
          }
        />
      </ModalContainer>

      {identifiedFeature.type === "RouteNode" && (
        <div className="feature-information-container">
          <div className="feature-informations">
            <p>
              <strong>{t("Name")}</strong>
              {`: ${
                routeNetworkElementResponse.data?.routeNetwork.routeElement
                  .namingInfo?.name ?? ""
              }`}
            </p>
            <p>
              <strong>{t("Kind")}</strong>
              {`: ${t(
                routeNetworkElementResponse.data?.routeNetwork.routeElement
                  .routeNodeInfo?.kind ?? ""
              )}`}
            </p>
            <p>
              <strong>{t("Function")}</strong>
              {`: ${t(
                routeNetworkElementResponse.data?.routeNetwork.routeElement
                  .routeNodeInfo?.function ?? ""
              )}`}
            </p>
          </div>
        </div>
      )}
      {identifiedFeature.type === "RouteNode" && (
        <DiagramMenu>
          <ToggleButton
            icon={PencilSvg}
            toggled={editMode}
            toggle={() => {
              setEditMode(!editMode);
              selectedFeatures.current = [];
            }}
            id="Edit"
            title="Edit mode"
          />
          <ActionButton
            icon={CutConduitSvg}
            action={() => cutSpanSegments()}
            title="Cut conduit"
            disabled={!editMode}
          />
          <ActionButton
            icon={DisconnectSvg}
            action={() => disconnectSpanSegments()}
            title="Disconnect conduit"
            disabled={!editMode}
          />
          <ActionButton
            icon={ConnectSvg}
            action={() => {
              connectSpanSegments();
            }}
            title="Connect conduit"
            disabled={!editMode}
          />
          <ActionButton
            icon={PutInContainerSvg}
            action={() => affixSpanEquipment()}
            title="Attach"
            disabled={!editMode}
          />
          <ActionButton
            icon={RemoveFromContainerSvg}
            action={() => detachSpanEquipment()}
            title="Detach"
            disabled={!editMode}
          />
          <ActionButton
            icon={PlusSvg}
            action={() => setShowAddContainer(true)}
            title="Add node container"
            disabled={!editMode}
          />
          <ActionButton
            icon={PlusSvg}
            action={() => setShowHandleInnerConduit(true)}
            title="Handle inner conduits"
            disabled={!editMode}
          />
          <ActionButton
            icon={TrashCanSvg}
            action={() => removeSpanStructure()}
            title="Delete"
            disabled={!editMode}
          />
        </DiagramMenu>
      )}
      <SchematicDiagram
        diagramObjects={diagramObjects}
        envelope={envelope}
        onSelectFeature={onSelectedFeature}
        editMode={editMode}
      />
    </div>
  );
}

export default IdentifyFeaturePage;
