import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useQuery, useSubscription, useMutation, useClient } from "urql";
import { MapboxGeoJSONFeature } from "mapbox-gl";
import DiagramMenu from "../../components/DiagramMenu";
import ModalContainer from "../../components/ModalContainer";
import SchematicDiagram from "./SchematicDiagram";
import ToggleButton from "../../components/ToggleButton";
import ActionButton from "../../components/ActionButton";
import Loading from "../../components/Loading";
import { MapContext } from "../../contexts/MapContext";
import RerouteTube from "./RerouteTube";
import EditSpanEquipment from "./EditSpanEquipment";
import SpanEquipmentDetails from "./SpanEquipmentDetails";
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
  QUERY_ROUTE_NETWORK_ELEMENT,
  QueryRouteNetworkElementResponse,
  REMOVE_SPAN_STRUCTURE,
  RemoveSpanStructureResponse,
  REVERSE_VERTICAL_ALIGNMENT,
  ReverseVerticalAlignmentResponse,
} from "./RouteNetworkDiagramGql";
import AddContainer from "./AddContainer";
import AddInnerSpanStructure from "./AddInnerSpanStructure";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import {
  ConnectSvg,
  CutConduitSvg,
  DisconnectSvg,
  PencilSvg,
  AddConduitSvg,
  AddStructureSvg,
  PutInContainerSvg,
  RemoveFromContainerSvg,
  TrashCanSvg,
  EraserSvg,
  EditPropertiesSvg,
  MoveConduitSvg,
  FlipSvg,
} from "../../assets";

type RouteNetworkDiagramProps = {
  enableEditMode: boolean;
};

function RouteNetworkDiagram({ enableEditMode }: RouteNetworkDiagramProps) {
  const client = useClient();
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const selectedFeatures = useRef<MapboxGeoJSONFeature[]>([]);
  const [singleSelectedFeature, setSingleSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>();
  const [showAddContainer, setShowAddContainer] = useState(false);
  const [showHandleInnerConduit, setShowHandleInnerConduit] = useState(false);
  const [showRerouteTube, setShowRerouteTube] = useState(false);
  const [showEditSpanEquipment, setShowEditSpanEquipment] = useState(false);
  const { identifiedFeature, setTraceRouteNetworkId } = useContext(MapContext);
  const [diagramObjects, setDiagramObjects] = useState<Diagram[]>([]);
  const [envelope, setEnvelope] = useState<Envelope>({
    maxX: 0,
    maxY: 0,
    minX: 0,
    minY: 0,
  });

  const [diagramQueryResult] = useQuery<DiagramQueryResponse>({
    query: GET_DIAGRAM,
    variables: {
      routeNetworkElementId: identifiedFeature?.id,
    },
    pause: !identifiedFeature?.id,
  });

  const [routeNetworkElementResponse] =
    useQuery<QueryRouteNetworkElementResponse>({
      query: QUERY_ROUTE_NETWORK_ELEMENT,
      variables: {
        routeElementId: identifiedFeature?.id,
      },
      pause: !identifiedFeature?.id,
    });

  const [, cutSpanSegmentsMutation] =
    useMutation<CutSpanSegmentsResponse>(CUT_SPAN_SEGMENTS);

  const [, affixSpanEquipmentMutation] =
    useMutation<AffixSpanEquipmentResponse>(
      AFFIX_SPAN_EQUIPMENT_TO_NODE_CONTAINER
    );

  const [, connectSpanSegmentsMutation] =
    useMutation<ConnectSpanSegmentsResponse>(CONNECT_SPAN_SEGMENTS);

  const [, disconnectSpanSegmentsMutation] =
    useMutation<DisconnectSpanSegmentsResponse>(DISCONNECT_SPAN_SEGMENTS);

  const [, detachSpanEquipmentMutation] =
    useMutation<DetachSpanEquipmentResponse>(
      DETACH_SPAN_EQUIPMENT_FROM_NODE_CONTAINER
    );

  const [res] = useSubscription<DiagramUpdatedResponse>({
    query: SCHEMATIC_DIAGRAM_UPDATED,
    variables: { routeNetworkElementId: identifiedFeature?.id },
    pause: !identifiedFeature?.id,
  });

  useEffect(() => {
    setEditMode(false);
  }, [identifiedFeature, setEditMode]);

  useEffect(() => {
    if (!diagramQueryResult.data) return;

    const { diagramObjects, envelope } =
      diagramQueryResult.data.schematic.buildDiagram;

    setDiagramObjects([...diagramObjects]);
    setEnvelope({ ...envelope });
    setShowAddContainer(false);
    setShowHandleInnerConduit(false);
    setShowRerouteTube(false);
    selectedFeatures.current = [];
    setSingleSelectedFeature(null);
    setShowEditSpanEquipment(false);
  }, [
    diagramQueryResult,
    setDiagramObjects,
    setEnvelope,
    setSingleSelectedFeature,
    setShowRerouteTube,
    setShowEditSpanEquipment,
    setShowHandleInnerConduit,
  ]);

  useEffect(() => {
    if (!res.data) return;

    const { diagramObjects, envelope } = res.data.schematicDiagramUpdated;

    setDiagramObjects([...diagramObjects]);
    setEnvelope({ ...envelope });
    setShowAddContainer(false);
    setShowHandleInnerConduit(false);
    setShowRerouteTube(false);
    selectedFeatures.current = [];
    setSingleSelectedFeature(null);
    setShowEditSpanEquipment(false);
  }, [
    res,
    setDiagramObjects,
    setEnvelope,
    setShowAddContainer,
    setSingleSelectedFeature,
    setShowEditSpanEquipment,
  ]);

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
    if (!data?.spanEquipment.affixSpanEquipmentToNodeContainer.isSuccess) {
      toast.error(
        t(
          data?.spanEquipment.affixSpanEquipmentToNodeContainer.errorCode ??
            "Error has occured"
        )
      );
    }
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
    if (!data?.spanEquipment.cutSpanSegments.isSuccess) {
      toast.error(
        t(data?.spanEquipment.cutSpanSegments.errorCode ?? "Error has occured")
      );
    }
  };

  const connectSpanSegments = async () => {
    const spanSegmentsToConnect = selectedFeatures.current
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

    const parameters: ConnectSpanSegmentsParameter = {
      routeNodeId: identifiedFeature.id,
      spanSegmentsToConnect: spanSegmentsToConnect,
    };

    const { data } = await connectSpanSegmentsMutation(parameters);
    if (!data?.spanEquipment.connectSpanSegments.isSuccess) {
      toast.error(
        t(
          data?.spanEquipment.connectSpanSegments.errorCode ??
            "Error has occured"
        )
      );
    }
  };

  const disconnectSpanSegments = async () => {
    const innerConduits = selectedFeatures.current
      .filter((x) => {
        return x.layer.source === "InnerConduit";
      })
      .map((x) => x.properties?.refId as string);

    const outerConduits = selectedFeatures.current
      .filter((x) => {
        return x.layer.source === "OuterConduit";
      })
      .map((x) => x.properties?.refId as string);

    const spanSegmentsToDisconnect = [...innerConduits, ...outerConduits];

    if (!identifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: DisconnectSpanSegmentsParameter = {
      routeNodeId: identifiedFeature.id,
      spanSegmentsToDisconnect: spanSegmentsToDisconnect,
    };

    const { data } = await disconnectSpanSegmentsMutation(parameters);
    if (!data?.spanEquipment.disconnectSpanSegments.isSuccess) {
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
    if (!data?.spanEquipment.detachSpanEquipmentFromNodeContainer.isSuccess) {
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

    if (!response.data?.spanEquipment.removeSpanStructure.isSuccess) {
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
          setTraceRouteNetworkId(feature.properties?.refId ?? []);
          setSingleSelectedFeature(feature);
        } else {
          setTraceRouteNetworkId("");
          setSingleSelectedFeature(null);
        }
      } else {
        if (isSelected) {
          selectedFeatures.current = [...selectedFeatures.current, feature];
        } else {
          selectedFeatures.current = selectedFeatures.current.filter((x) => {
            const t =
              x.properties?.refId !== feature.properties?.refId ||
              x.properties?.type !== feature.properties?.type;

            return t;
          });
        }
      }
    },
    [editMode, setSingleSelectedFeature, setTraceRouteNetworkId]
  );

  const reverseVertialAlignment = async () => {
    const nodeContainer = selectedFeatures.current.find(
      (x) => x.layer.source === "NodeContainerSide"
    );

    const nodeContainerId = nodeContainer?.properties?.refId as string;

    if (!nodeContainerId) {
      toast.error(t("No node container selected"));
      return;
    }

    const result = await client
      .mutation<ReverseVerticalAlignmentResponse>(REVERSE_VERTICAL_ALIGNMENT, {
        nodeContainerId: nodeContainerId,
      })
      .toPromise();

    if (!result.data?.nodeContainer.reverseVerticalContentAlignment.isSuccess) {
      toast.error(
        t(
          result.data?.nodeContainer.reverseVerticalContentAlignment
            .errorCode ?? "Error has occurred"
        )
      );
    }
  };

  const clearHighlights = () => {
    setTraceRouteNetworkId("");
  };

  if (diagramQueryResult.fetching) {
    return <Loading />;
  }

  if (!identifiedFeature?.id) {
    return <div></div>;
  }

  return (
    <div className="route-network-diagram">
      <ModalContainer
        show={showAddContainer}
        closeCallback={() => setShowAddContainer(false)}
      >
        <AddContainer />
      </ModalContainer>

      <ModalContainer
        show={showHandleInnerConduit}
        closeCallback={() => setShowHandleInnerConduit(false)}
      >
        <AddInnerSpanStructure
          selectedOuterConduit={
            selectedFeatures.current.find((x) => x.source === "OuterConduit")
              ?.properties?.refId ?? ""
          }
        />
      </ModalContainer>

      <ModalContainer
        show={showRerouteTube}
        closeCallback={() => setShowRerouteTube(false)}
      >
        <RerouteTube
          selectedRouteSegmentMrid={
            singleSelectedFeature?.properties?.refId ?? ""
          }
        />
      </ModalContainer>

      <ModalContainer
        show={showEditSpanEquipment}
        closeCallback={() => setShowEditSpanEquipment(false)}
      >
        <EditSpanEquipment
          spanEquipmentMrid={singleSelectedFeature?.properties?.refId ?? ""}
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
      {identifiedFeature.type === "RouteNode" && enableEditMode && (
        <DiagramMenu>
          <ToggleButton
            icon={PencilSvg}
            toggled={editMode}
            toggle={() => {
              setEditMode(!editMode);
              selectedFeatures.current = [];
              setSingleSelectedFeature(null);
            }}
            id="Edit"
            title={t("EDIT_MODE")}
          />
          <ActionButton
            icon={CutConduitSvg}
            action={() => cutSpanSegments()}
            title={t("CUT_CONDUIT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={DisconnectSvg}
            action={() => disconnectSpanSegments()}
            title={t("DISCONNECT_CONDUIT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={ConnectSvg}
            action={() => {
              connectSpanSegments();
            }}
            title={t("CONNECT_CONDUIT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={PutInContainerSvg}
            action={() => affixSpanEquipment()}
            title={t("AFFIX_SPAN_EQUIPMENT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={RemoveFromContainerSvg}
            action={() => detachSpanEquipment()}
            title={t("DETACH_SPAN_EQUIPMENT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={AddStructureSvg}
            action={() => setShowAddContainer(true)}
            title={t("ADD_NODE_CONTAINER")}
            disabled={!editMode}
          />
          <ActionButton
            icon={AddConduitSvg}
            action={() => setShowHandleInnerConduit(true)}
            title={t("ADD_INNER_CONDUIT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={TrashCanSvg}
            action={() => removeSpanStructure()}
            title={t("REMOVE_OBJECT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={FlipSvg}
            action={() => reverseVertialAlignment()}
            title={t("REVERSE_VERTICAL_ALIGNMENT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={EraserSvg}
            action={() => clearHighlights()}
            title={t("CLEAR_HIGHLIGHT")}
          />
        </DiagramMenu>
      )}
      {identifiedFeature.type === "RouteNode" && !enableEditMode && (
        <DiagramMenu>
          <ActionButton
            icon={EraserSvg}
            action={() => clearHighlights()}
            title={t("CLEAR_HIGHLIGHT")}
          />
        </DiagramMenu>
      )}
      {identifiedFeature.type === "RouteSegment" && (
        <DiagramMenu>
          <ActionButton
            icon={EraserSvg}
            action={() => clearHighlights()}
            title={t("CLEAR_HIGHLIGHT")}
          />
        </DiagramMenu>
      )}
      <SchematicDiagram
        diagramObjects={diagramObjects}
        envelope={envelope}
        onSelectFeature={onSelectedFeature}
        editMode={editMode}
      />
      {!editMode && singleSelectedFeature && (
        <div className="feature-details">
          <div className="feature-details-container">
            <div className="feature-details-info">
              <SpanEquipmentDetails
                spanEquipmentMrid={
                  singleSelectedFeature?.properties?.refId ?? ""
                }
              />
            </div>
            {enableEditMode && (
              <div className="feature-details-actions">
                <ActionButton
                  icon={EditPropertiesSvg}
                  action={() => setShowEditSpanEquipment(true)}
                  title={t("EDIT")}
                />
                <ActionButton
                  icon={MoveConduitSvg}
                  action={() => setShowRerouteTube(true)}
                  title={t("MOVE")}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteNetworkDiagram;
