import {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
  useReducer,
} from "react";
import { useMutation, useClient } from "urql";
import { MapboxGeoJSONFeature } from "maplibre-gl";
import DiagramMenu from "../../../components/DiagramMenu";
import ModalContainer from "../../../components/ModalContainer";
import SchematicDiagram from "../SchematicDiagram";
import ToggleButton from "../../../components/ToggleButton";
import ActionButton from "../../../components/ActionButton";
import MultiOptionActionButton from "../../../components/MultiOptionActionButton";
import { MapContext } from "../../../contexts/MapContext";
import NodeContainerDetails from "../NodeContainerDetails";
import SpanEquipmentDetails from "../SpanEquipmentDetails";
import FeatureInformation from "../FeatureInformation";
import EstablishCustomerConnection from "../EstablishCustomerConnection";
import AddRack from "../AddRack";
import AddTerminalEquipment from "../AddTerminalEquipment";
import {
  Diagram,
  Envelope,
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
  REMOVE_SPAN_STRUCTURE,
  RemoveSpanStructureResponse,
  REVERSE_VERTICAL_ALIGNMENT,
  ReverseVerticalAlignmentResponse,
  SPAN_SEGMENT_TRACE,
  SpanSegmentTraceResponse,
  REMOVE_NODE_CONTAINER,
  RemoveNodeContainerResponse,
} from "./EditDiagramGql";
import AddContainer from "../AddContainer";
import AddInnerSpanStructure from "../AddInnerSpanStructure";
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
  FlipSvg,
  EstablishCustomerConnectionSvg,
} from "../../../assets";

type RouteNetworkDiagramProps = {
  diagramObjects: Diagram[];
  envelope: Envelope;
};

function containsNodeContainer(diagramObjects: Diagram[]): boolean {
  return diagramObjects.find((x) => x.style === "NodeContainer") ? true : false;
}

interface ShowModals {
  addContainer: boolean;
  handleInnerConduit: boolean;
  establishCustomerConnection: boolean;
  addRack: boolean;
  addTerminalEquipment: boolean;
}

interface ShowModalsAction {
  type:
    | "addContainer"
    | "addInnerConduit"
    | "establishCustomerConnection"
    | "addRack"
    | "addTerminalEquipment"
    | "reset";
  show?: boolean;
}

const showModalsInitialState: ShowModals = {
  addContainer: false,
  establishCustomerConnection: false,
  handleInnerConduit: false,
  addRack: false,
  addTerminalEquipment: false,
};

function showModalsReducer(
  state: ShowModals,
  action: ShowModalsAction
): ShowModals {
  switch (action.type) {
    case "addContainer":
      return {
        ...state,
        addContainer: action.show ?? !state.addContainer,
      };
    case "addInnerConduit":
      return {
        ...state,
        handleInnerConduit: action.show ?? !state.handleInnerConduit,
      };
    case "establishCustomerConnection":
      return {
        ...state,
        establishCustomerConnection:
          action.show ?? !state.establishCustomerConnection,
      };
    case "addRack":
      return {
        ...state,
        addRack: action.show ?? !state.addRack,
      };
    case "addTerminalEquipment":
      return {
        ...state,
        addTerminalEquipment: action.show ?? !state.addTerminalEquipment,
      };
    case "reset":
      return { ...showModalsInitialState };
    default:
      throw new Error();
  }
}

function EditDiagram({ diagramObjects, envelope }: RouteNetworkDiagramProps) {
  const client = useClient();
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const selectedFeatures = useRef<MapboxGeoJSONFeature[]>([]);
  const [singleSelectedFeature, setSingleSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>();
  const { identifiedFeature, setTrace } = useContext(MapContext);
  const [showModals, showModalsDispatch] = useReducer(
    showModalsReducer,
    showModalsInitialState
  );

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

  useEffect(() => {
    setEditMode(false);
  }, [identifiedFeature, setEditMode]);

  useEffect(() => {
    showModalsDispatch({ type: "reset" });
    selectedFeatures.current = [];
    setSingleSelectedFeature(null);
  }, [showModalsDispatch, diagramObjects, envelope, setSingleSelectedFeature]);

  const affixSpanEquipment = async () => {
    const nodeContainer = selectedFeatures.current.find(
      (x) => x.layer.source === "NodeContainerSide"
    );

    const nodeContainerId = nodeContainer?.properties?.refId as string;

    const spanSegmentIds = selectedFeatures.current
      .filter((x) => x.layer.source === "OuterConduit")
      ?.map((x) => x.properties?.refId as string);

    if (!nodeContainerId) {
      toast.error(t("No node container selected"));
      return;
    }
    if (spanSegmentIds.length === 0) {
      toast.error(t("No span segments selected"));
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
      spanSegmentIds: spanSegmentIds,
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
    const spanSegmentsIds = selectedFeatures.current
      .filter((x) => {
        return (
          x.layer.source === "InnerConduit" || x.layer.source === "OuterConduit"
        );
      })
      .map((x) => x.properties?.refId as string);

    if (spanSegmentsIds.length === 0) {
      toast.error(t("No span segments selected"));
      return;
    }

    if (!identifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: DetachSpanEquipmentParameters = {
      routeNodeId: identifiedFeature.id,
      spanSegmentIds: spanSegmentsIds,
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

  const removeObject = async () => {
    const selectedObjects = selectedFeatures.current
      .filter((x) => {
        return (
          x.layer.source === "OuterConduit" || "InnerConduit" || "NodeContainer"
        );
      })
      .map((x) => {
        return {
          id: x.properties?.refId as string,
          source: x.layer.source,
        };
      });

    if (selectedObjects.length > 1) {
      toast.error(t("You can only delete one object at a time"));
      return;
    } else if (selectedObjects.length === 0) {
      toast.error(t("No objects selected"));
      return;
    }

    const confirmed = window.confirm(
      t("Are you sure you want to delete the selected object?")
    );
    if (!confirmed) return;

    const objectToRemove = selectedObjects[0];

    if (objectToRemove.source === "NodeContainer") {
      const response = await client
        .mutation<RemoveNodeContainerResponse>(REMOVE_NODE_CONTAINER, {
          nodeContainerId: objectToRemove.id,
        })
        .toPromise();

      if (!response.data?.nodeContainer.remove.isSuccess) {
        toast.error(t(response.data?.nodeContainer.remove.errorCode ?? ""));
      }
    } else if (objectToRemove.source === "OuterConduit" || "InnerConduit") {
      const response = await client
        .mutation<RemoveSpanStructureResponse>(REMOVE_SPAN_STRUCTURE, {
          spanSegmentId: objectToRemove.id,
        })
        .toPromise();

      if (!response.data?.spanEquipment.removeSpanStructure.isSuccess) {
        toast.error(
          t(response.data?.spanEquipment.removeSpanStructure.errorCode ?? "")
        );
      }
    }
  };

  const onSelectedFeature = useCallback(
    async (feature: MapboxGeoJSONFeature) => {
      const isSelected = feature.state?.selected as boolean;

      if (!editMode) {
        if (isSelected) {
          if (feature.properties?.type !== "NodeContainer") {
            const segmentTrace = await client
              .query<SpanSegmentTraceResponse>(SPAN_SEGMENT_TRACE, {
                spanSegmentId: feature.properties?.refId,
              })
              .toPromise();

            setTrace({
              geometries:
                segmentTrace.data?.utilityNetwork.spanSegmentTrace
                  .routeNetworkSegmentGeometries ?? [],
              ids:
                segmentTrace.data?.utilityNetwork.spanSegmentTrace
                  .routeNetworkSegmentIds ?? [],
            });
          }
          setSingleSelectedFeature(feature);
        } else {
          setTrace({ geometries: [], ids: [] });
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
    [editMode, setSingleSelectedFeature, setTrace, client]
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
    setTrace({ geometries: [], ids: [] });
  };

  if (!identifiedFeature?.id) {
    return <div></div>;
  }

  return (
    <div className="route-network-diagram">
      <ModalContainer
        show={showModals.addContainer}
        closeCallback={() =>
          showModalsDispatch({ type: "addContainer", show: false })
        }
      >
        <AddContainer />
      </ModalContainer>

      <ModalContainer
        show={showModals.handleInnerConduit}
        closeCallback={() =>
          showModalsDispatch({ type: "addInnerConduit", show: false })
        }
      >
        <AddInnerSpanStructure
          selectedOuterConduit={
            selectedFeatures.current.find((x) => x.source === "OuterConduit")
              ?.properties?.refId ?? ""
          }
        />
      </ModalContainer>

      <ModalContainer
        show={showModals.establishCustomerConnection}
        closeCallback={() =>
          showModalsDispatch({
            type: "establishCustomerConnection",
            show: false,
          })
        }
      >
        <EstablishCustomerConnection
          routeNodeId={identifiedFeature.id}
          load={showModals.establishCustomerConnection}
        />
      </ModalContainer>

      <ModalContainer
        title={t("ADD_RACK")}
        show={showModals.addRack}
        closeCallback={() =>
          showModalsDispatch({
            type: "addRack",
            show: false,
          })
        }
      >
        <AddRack />
      </ModalContainer>

      <ModalContainer
        title={t("ADD_TERMINAL_EQUIPMENT")}
        show={showModals.addTerminalEquipment}
        closeCallback={() =>
          showModalsDispatch({
            type: "addTerminalEquipment",
            show: false,
          })
        }
      >
        <AddTerminalEquipment />
      </ModalContainer>

      <FeatureInformation />

      {identifiedFeature.type === "RouteNode" && (
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
          <MultiOptionActionButton
            icon={AddStructureSvg}
            actions={[
              {
                text: t("ADD_NODE_CONTAINER"),
                action: () =>
                  showModalsDispatch({ type: "addContainer", show: true }),
                disabled: containsNodeContainer(diagramObjects),
                key: 0,
              },
              {
                text: t("ADD_RACK"),
                action: () =>
                  showModalsDispatch({ type: "addRack", show: true }),
                disabled: !containsNodeContainer(diagramObjects),
                key: 1,
              },
              {
                text: t("ADD_TERMINAL_EQUIPMENT"),
                action: () =>
                  showModalsDispatch({
                    type: "addTerminalEquipment",
                    show: true,
                  }),
                disabled: !containsNodeContainer(diagramObjects),
                key: 2,
              },
            ]}
            title={t("ADD_NODE_CONTAINER")}
            disabled={!editMode}
          />
          <ActionButton
            icon={AddConduitSvg}
            action={() =>
              showModalsDispatch({ type: "addInnerConduit", show: true })
            }
            title={t("ADD_INNER_CONDUIT")}
            disabled={!editMode}
          />
          <ActionButton
            icon={TrashCanSvg}
            action={() => removeObject()}
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
            icon={EstablishCustomerConnectionSvg}
            action={() =>
              showModalsDispatch({
                type: "establishCustomerConnection",
                show: true,
              })
            }
            title={t("ESTABLISH_CUSTOMER_CONNECTION")}
          />
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
      {!editMode &&
        (singleSelectedFeature?.source === "InnerConduit" ||
          singleSelectedFeature?.source === "OuterConduit") && (
          <SpanEquipmentDetails
            spanEquipmentMrid={singleSelectedFeature?.properties?.refId ?? ""}
            showActions={true}
          />
        )}
      {!editMode && singleSelectedFeature?.source === "NodeContainer" && (
        <NodeContainerDetails
          nodeContainerMrid={singleSelectedFeature?.properties?.refId ?? ""}
          showActions={true}
        />
      )}
    </div>
  );
}

export default EditDiagram;
