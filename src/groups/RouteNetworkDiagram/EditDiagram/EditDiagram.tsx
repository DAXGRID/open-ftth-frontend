import {
  useEffect,
  useState,
  useContext,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import { useMutation, useClient } from "urql";
import { MapboxGeoJSONFeature } from "maplibre-gl";
import DiagramMenu from "../../../components/DiagramMenu";
import SchematicDiagram from "../SchematicDiagram";
import ToggleButton from "../../../components/ToggleButton";
import ActionButton from "../../../components/ActionButton";
import MultiOptionActionButton from "../../../components/MultiOptionActionButton";
import { MapContext } from "../../../contexts/MapContext";
import { OverlayContext } from "../../../contexts/OverlayContext";
import NodeContainerDetails from "../NodeContainerDetails";
import SpanEquipmentDetails from "../SpanEquipmentDetails";
import FeatureInformation from "../FeatureInformation";
import TerminalEquipment from "../../TerminalEquipment";
import ConnectivityView from "../ConnectivityView";
import PassageView from "../PassageView";
import TabView from "../../../components/TabView";
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
  AFFIX_SPAN_EQUIPMENT_TO_PARENT,
  AffixSpanEquipmentToParentParams,
  AffixSpanEquipmentToParentResponse,
} from "./EditDiagramGql";
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
import {
  addContainerModal,
  addInnerConduitModal,
  establishCustomerConnectionModal,
  addRackModal,
  addTerminalEquipmentModal,
} from "./Modals";

type RouteNetworkDiagramProps = {
  diagramObjects: Diagram[];
  envelope: Envelope;
};

function canAffixSpanEquipment(selected: MapboxGeoJSONFeature[]): boolean {
  const nodeContainer = selected.find(
    (x) => x.layer.source === "NodeContainerSide"
  );

  const spanSegmentIds = selected
    .filter((x) => x.layer.source === "OuterConduit")
    ?.map((x) => x.properties?.refId as string);

  return spanSegmentIds.length > 0 && !!nodeContainer;
}

function canAffixSpanEquipmentToParent(
  selected: MapboxGeoJSONFeature[]
): boolean {
  const invalidSelections = selected.filter(
    (x) => x.layer.source !== "FiberCable" && x.layer.source !== "InnerConduit"
  );
  const fiberCables = selected.filter((x) => x.layer.source === "FiberCable");
  const innerConduits = selected.filter(
    (x) => x.layer.source === "InnerConduit"
  );

  return (
    invalidSelections.length === 0 &&
    fiberCables.length === 1 &&
    innerConduits.length === 1
  );
}

function containsNodeContainer(diagramObjects: Diagram[]): boolean {
  return diagramObjects.find((x) => x.style === "NodeContainer") ? true : false;
}

function isSingleSelected(
  source: string,
  selected: MapboxGeoJSONFeature[]
): boolean {
  if (selected.length > 1) return false;
  return selected.find((x) => x.source === source) ? true : false;
}

interface ShowModals {
  addContainer: boolean;
  addInnerConduit: boolean;
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
  addInnerConduit: false,
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
        addInnerConduit: action.show ?? !state.addInnerConduit,
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
      throw new Error(`No action with type ${action.type}`);
  }
}

function EditDiagram({ diagramObjects, envelope }: RouteNetworkDiagramProps) {
  const client = useClient();
  const { t } = useTranslation();
  const { showElement } = useContext(OverlayContext);
  const [editMode, setEditMode] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<
    MapboxGeoJSONFeature[]
  >([]);
  const [singleSelectedFeature, setSingleSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>();
  const [spanEquipmentTabViewSelectedId, setSpanEquipmentTabViewSelectedId] =
    useState("0");
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
    setSelectedFeatures([]);
    setSingleSelectedFeature(null);
    setSpanEquipmentTabViewSelectedId("0");
  }, [
    showModalsDispatch,
    diagramObjects,
    envelope,
    setSingleSelectedFeature,
    setSpanEquipmentTabViewSelectedId,
  ]);

  const affixSpanEquipment = async () => {
    const nodeContainer = currentlySelectedFeatures.find(
      (x) => x.layer.source === "NodeContainerSide"
    );

    const nodeContainerId = nodeContainer?.properties?.refId as string;

    const spanSegmentIds = currentlySelectedFeatures
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
    const spanSegmentsToCut = currentlySelectedFeatures
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
    const spanSegmentsToConnect = currentlySelectedFeatures
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
    const innerConduits = currentlySelectedFeatures
      .filter((x) => {
        return x.layer.source === "InnerConduit";
      })
      .map((x) => x.properties?.refId as string);

    const outerConduits = currentlySelectedFeatures
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
    const spanSegmentsIds = currentlySelectedFeatures
      .filter((x) => {
        return (
          x.layer.source === "InnerConduit" ||
          x.layer.source === "OuterConduit" ||
          x.layer.source === "FiberCable"
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
    const selectedObjects = currentlySelectedFeatures
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
          if (
            feature.properties?.type?.startsWith("InnerConduit") ||
            feature.properties?.type?.startsWith("OuterConduit") ||
            feature.properties?.type === "FiberCable"
          ) {
            // Then we trace the conduit.
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
        setSingleSelectedFeature(feature);
      }
    },
    [editMode, setSingleSelectedFeature, setTrace, client]
  );

  useEffect(() => {
    // This whole useeffect is a special case, this is needed to done because if not,
    // the schematic diagram depdency will keep reloading everytime a diagram object is being clicked.
    // This is mainly an issue because of mapbox not playing to nicely with the way react works so it rerenders the map.
    if (!singleSelectedFeature) return;

    const found = selectedFeatures.find(
      (x) =>
        x.properties?.refId === singleSelectedFeature.properties?.refId &&
        x.properties?.type === singleSelectedFeature.properties?.type
    );

    if (!found) {
      setSelectedFeatures([...selectedFeatures, singleSelectedFeature]);
    } else if (
      (found.state.selected as boolean) !==
      (singleSelectedFeature.state.selected as boolean)
    ) {
      setSelectedFeatures([
        ...selectedFeatures.filter(
          (x) =>
            !(
              x.properties?.refId === found.properties?.refId &&
              x.properties?.type === found.properties?.type
            )
        ),
        singleSelectedFeature,
      ]);
    }
  }, [singleSelectedFeature, setSelectedFeatures, selectedFeatures]);

  const currentlySelectedFeatures = useMemo(() => {
    return selectedFeatures.filter((x) => x.state?.selected);
  }, [selectedFeatures]);

  useEffect(() => {
    if (showModals.addContainer) {
      showElement(
        addContainerModal(
          () => showModalsDispatch({ type: "addContainer", show: false }),
          t("ADD_NODE_CONTAINER")
        )
      );
    } else if (showModals.addInnerConduit) {
      showElement(
        addInnerConduitModal(
          () => showModalsDispatch({ type: "addInnerConduit", show: false }),
          t("ADD_INNER_CONDUIT"),
          currentlySelectedFeatures
        )
      );
    } else if (showModals.establishCustomerConnection) {
      showElement(
        establishCustomerConnectionModal(
          () =>
            showModalsDispatch({
              type: "establishCustomerConnection",
              show: false,
            }),
          t("ESTABLISH_CUSTOMER_CONNECTION"),
          identifiedFeature?.id ?? ""
        )
      );
    } else if (showModals.addRack) {
      showElement(
        addRackModal(
          () =>
            showModalsDispatch({
              type: "addRack",
              show: false,
            }),
          t("ADD_RACK"),
          currentlySelectedFeatures
        )
      );
    } else if (showModals.addTerminalEquipment) {
      showElement(
        addTerminalEquipmentModal(
          () =>
            showModalsDispatch({ type: "addTerminalEquipment", show: false }),
          t("ADD_TERMINAL_EQUIPMENT"),
          identifiedFeature?.id ?? "",
          currentlySelectedFeatures
        )
      );
    } else {
      showElement(null);
    }
  }, [
    showModals,
    identifiedFeature?.id,
    t,
    currentlySelectedFeatures,
    showElement,
  ]);

  const reverseVertialAlignment = async () => {
    const nodeContainer = currentlySelectedFeatures.find(
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

  const affixSpanEquipmentToParent = async () => {
    const fiberCable = currentlySelectedFeatures.find(
      (x) => x.layer.source === "FiberCable"
    );

    const innerConduit = currentlySelectedFeatures.find(
      (x) => x.layer.source === "InnerConduit"
    );

    const params: AffixSpanEquipmentToParentParams = {
      routeNodeId: identifiedFeature?.id ?? "",
      spanSegmentIdOne: fiberCable?.properties?.refId ?? "",
      spanSegmentIdTwo: innerConduit?.properties?.refId ?? "",
    };

    const response = await client
      .mutation<AffixSpanEquipmentToParentResponse>(
        AFFIX_SPAN_EQUIPMENT_TO_PARENT,
        params
      )
      .toPromise();

    if (!response.data?.spanEquipment.affixSpanEquipmentToParent.isSuccess) {
      toast.error(
        t(
          response.data?.spanEquipment.affixSpanEquipmentToParent.errorCode ??
            "ERROR"
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
      <FeatureInformation />

      {identifiedFeature.type === "RouteNode" && (
        <DiagramMenu>
          <ToggleButton
            icon={PencilSvg}
            toggled={editMode}
            toggle={() => {
              setEditMode(!editMode);
              setSelectedFeatures([]);
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
          <MultiOptionActionButton
            icon={PutInContainerSvg}
            actions={[
              {
                text: t("AFFIX_SPAN_EQUIPMENT"),
                action: () => affixSpanEquipment(),
                disabled: !canAffixSpanEquipment(currentlySelectedFeatures),
                key: 0,
              },
              {
                text: t("PLACE_CABLE_IN_CONDUIT"),
                action: () => affixSpanEquipmentToParent(),
                disabled: !canAffixSpanEquipmentToParent(
                  currentlySelectedFeatures
                ),
                key: 1,
              },
            ]}
            title={t("ADD_NODE_CONTAINER")}
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
                disabled: !isSingleSelected(
                  "NodeContainer",
                  currentlySelectedFeatures
                ),
                key: 1,
              },
              {
                text: t("ADD_TERMINAL_EQUIPMENT"),
                action: () =>
                  showModalsDispatch({
                    type: "addTerminalEquipment",
                    show: true,
                  }),
                disabled:
                  !isSingleSelected("Rack", currentlySelectedFeatures) &&
                  !isSingleSelected("NodeContainer", currentlySelectedFeatures),
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
        routeElementId={identifiedFeature.id}
      />
      {!editMode && singleSelectedFeature?.source === "NodeContainer" && (
        <NodeContainerDetails
          nodeContainerMrid={singleSelectedFeature?.properties?.refId ?? ""}
          showActions={true}
        />
      )}
      {!editMode &&
        (singleSelectedFeature?.source === "Rack" ||
          singleSelectedFeature?.source === "TerminalEquipment") && (
          <div className="container-max-size container-center">
            <div className="container-background ">
              <TerminalEquipment
                routeNodeId={identifiedFeature?.id ?? ""}
                terminalEquipmentOrRackId={
                  singleSelectedFeature.properties?.refId ?? ""
                }
              />
            </div>
          </div>
        )}
      {!editMode &&
        (singleSelectedFeature?.source === "FiberCable" ||
          singleSelectedFeature?.source.includes("Conduit")) && (
          <div className="container-max-size container-center">
            {
              <SpanEquipmentDetails
                disableMove={true}
                spanEquipmentMrid={
                  singleSelectedFeature?.properties?.refId ?? ""
                }
                showActions={true}
              />
            }
            <TabView
              selectedId={spanEquipmentTabViewSelectedId}
              select={setSpanEquipmentTabViewSelectedId}
              views={[
                {
                  title: t("PASSAGE_VIEW"),
                  view: (
                    <PassageView
                      routeElementId={identifiedFeature?.id ?? ""}
                      spanEquipmentOrSegmentIds={
                        singleSelectedFeature.properties?.refId ?? ""
                      }
                    />
                  ),
                  id: "0",
                },
                {
                  title: t("CONNECTIVITY"),
                  view: (
                    <ConnectivityView
                      routeNetworkElementId={identifiedFeature?.id ?? ""}
                      spanEquipmentId={
                        singleSelectedFeature.properties?.refId ?? ""
                      }
                    />
                  ),
                  id: "1",
                },
              ]}
            />
          </div>
        )}
    </div>
  );
}

export default EditDiagram;
