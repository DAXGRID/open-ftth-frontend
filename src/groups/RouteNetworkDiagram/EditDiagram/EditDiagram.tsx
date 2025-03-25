import {
  useEffect,
  useState,
  useContext,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import { useMutation, useClient } from "urql";
import { MapGeoJSONFeature } from "maplibre-gl";
import DiagramMenu from "../../../components/DiagramMenu";
import SchematicDiagram from "../SchematicDiagram";
import ToggleButton from "../../../components/ToggleButton";
import ActionButton from "../../../components/ActionButton";
import MultiOptionActionButton from "../../../components/MultiOptionActionButton";
import { MapContext, IdentifiedFeature } from "../../../contexts/MapContext";
import { OverlayContext } from "../../../contexts/OverlayContext";
import { DiagramContext } from "../DiagramContext";
import NodeContainerDetails from "../NodeContainerDetails";
import FeatureInformation from "../FeatureInformation";
import TerminalEquipment from "../../TerminalEquipment";
import ConnectivityView from "../ConnectivityView";
import PassageView from "../PassageView";
import TabView from "../../../components/TabView";
import GeneralTerminalEquipmentView from "../GeneralTerminalEquipmentView";
import GeneralSpanEquipmentView from "../GeneralSpanEquipmentView";
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
  REMOVE_RACK_FROM_NODE_CONTAINER,
  RemoveRackFromNodeContainerParams,
  RemoveRackFromNodeContainerResponse,
  REMOVE_TERMINAL_EQUIPMENT,
  RemoveTerminalEquipmentParams,
  RemoveTerminalEquipmentResponse,
  MOVE_RACK_EQUIPMENT,
  MoveRackEquipmentParams,
  MoveRackEquipmentResponse,
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
  ZoomMapSvg,
  OutageSvg,
  MoveEquipmentSvg,
} from "../../../assets";
import {
  addContainerModal,
  addInnerConduitModal,
  establishCustomerConnectionModal,
  addRackModal,
  addTerminalEquipmentModal,
  outageViewModal,
  arrangeRackEquipmentModal,
} from "./Modals";

type RouteNetworkDiagramProps = {
  diagramObjects: Diagram[];
  envelope: Envelope;
};

function isTraceable(f: MapGeoJSONFeature): boolean {
  return (
    f.properties?.type?.startsWith("InnerConduit") ||
    f.properties?.type?.startsWith("OuterConduit") ||
    f.properties?.type === "FiberCable"
  );
}

function canAffixSpanEquipment(selected: MapGeoJSONFeature[]): boolean {
  const nodeContainer = selected.find(
    (x) => x.layer.source === "NodeContainerSide",
  );

  const spanSegmentIds = selected
    .filter((x) => x.layer.source === "OuterConduit")
    ?.map((x) => x.properties?.refId as string);

  return spanSegmentIds.length > 0 && !!nodeContainer;
}

function canAffixSpanEquipmentToParent(
  selected: MapGeoJSONFeature[],
): boolean {
  const invalidSelections = selected.filter(
    (x) =>
      x.layer.source !== "FiberCable" &&
      x.layer.source !== "InnerConduit" &&
      x.layer.source !== "OuterConduit",
  );

  const fiberCables = selected.filter((x) => x.layer.source === "FiberCable");
  const innerConduits = selected.filter(
    (x) =>
      x.layer.source === "InnerConduit" || x.layer.source === "OuterConduit",
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

function eligibleToMoveRackEquipment(
  selectedFeatures: MapGeoJSONFeature[],
): boolean {
  const containsFreeRackSpace = selectedFeatures.find(
    (x) => x.source === "FreeRackSpace",
  );
  const containsTerminalEquipment = selectedFeatures.find(
    (x) => x.source === "TerminalEquipment",
  );

  return (
    !!containsFreeRackSpace &&
    !!containsTerminalEquipment &&
    // To avoid that the user selects multiple things at the same time.
    selectedFeatures.length === 2
  );
}

function eligableToArrangeTerminalEquipment(
  selectedFeatures: MapGeoJSONFeature[],
): boolean {
  const containsTerminalEquipment = selectedFeatures.find(
    (x) => x.source === "TerminalEquipment",
  );

  return (
    !!containsTerminalEquipment &&
    // To avoid that the user selects multiple things at the same time.
    selectedFeatures.length === 1
  );
}

function isSingleSelected(
  source: string,
  selected: MapGeoJSONFeature[],
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
  outageView: boolean;
  arrangeRackEquipment: boolean;
}

interface ShowModalsAction {
  type:
    | "addContainer"
    | "addInnerConduit"
    | "establishCustomerConnection"
    | "addRack"
    | "addTerminalEquipment"
    | "outageView"
    | "arrangeRackEquipment"
    | "reset";
  show?: boolean;
}

const showModalsInitialState: ShowModals = {
  addContainer: false,
  establishCustomerConnection: false,
  addInnerConduit: false,
  addRack: false,
  addTerminalEquipment: false,
  outageView: false,
  arrangeRackEquipment: false,
};

function showModalsReducer(
  state: ShowModals,
  action: ShowModalsAction,
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
    case "outageView":
      return {
        ...state,
        outageView: action.show ?? !state.outageView,
      };
    case "arrangeRackEquipment":
      return {
        ...state,
        arrangeRackEquipment: action.show ?? !state.arrangeRackEquipment,
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
  const { enabledTracePan, setEnabledTracePan } = useContext(DiagramContext);
  const [editMode, setEditMode] = useState(false);
  // Do not use this for getting the current selected features, instead use `currentlySelectedFeatures`.
  const [selectedFeatures, setSelectedFeatures] = useState<
    MapGeoJSONFeature[]
  >([]);
  const [singleSelectedFeature, setSingleSelectedFeature] =
    useState<MapGeoJSONFeature | null>();
  const [spanEquipmentTabViewSelectedId, setSpanEquipmentTabViewSelectedId] =
    useState("0");
  const [rackTabViewSelectedId, setRackTabViewSelectedId] = useState("0");
  const { setTrace, identifiedFeature } = useContext(MapContext);
  const [showModals, showModalsDispatch] = useReducer(
    showModalsReducer,
    showModalsInitialState,
  );
  // This is a hack to avoid re-renders before all state have been set.
  // This could have been much cleaner with a reducer, but that is not an easy solution to implement.
  const [localIdentifiedFeature, setLocalIdentifiedFeature] =
    useState<IdentifiedFeature | null>();

  const [, cutSpanSegmentsMutation] =
    useMutation<CutSpanSegmentsResponse>(CUT_SPAN_SEGMENTS);

  const [, affixSpanEquipmentMutation] =
    useMutation<AffixSpanEquipmentResponse>(
      AFFIX_SPAN_EQUIPMENT_TO_NODE_CONTAINER,
    );

  const [, connectSpanSegmentsMutation] =
    useMutation<ConnectSpanSegmentsResponse>(CONNECT_SPAN_SEGMENTS);

  const [, disconnectSpanSegmentsMutation] =
    useMutation<DisconnectSpanSegmentsResponse>(DISCONNECT_SPAN_SEGMENTS);

  const [, detachSpanEquipmentMutation] =
    useMutation<DetachSpanEquipmentResponse>(
      DETACH_SPAN_EQUIPMENT_FROM_NODE_CONTAINER,
    );

  useEffect(() => {
    setEditMode(false);
    setLocalIdentifiedFeature(identifiedFeature);
    setSingleSelectedFeature(null);
    setSelectedFeatures([]);
  }, [
    identifiedFeature,
    setEditMode,
    setLocalIdentifiedFeature,
    setSingleSelectedFeature,
    setSelectedFeatures,
  ]);

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
      (x) => x.layer.source === "NodeContainerSide",
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
            "Error has occured",
        ),
      );
    }
  };

  const cutSpanSegments = async () => {
    const conduitsToCut = currentlySelectedFeatures
      .filter((x) => {
        return (
          x.layer.source === "InnerConduit" || x.layer.source === "OuterConduit"
        );
      })
      .map((x) => x.properties?.refId as string);

    const fiberCablesToCut = currentlySelectedFeatures
      .filter((x) => {
        return x.layer.source === "FiberCable";
      })
      .map((x) => x.properties?.refId as string);

    if (fiberCablesToCut.length > 0 && conduitsToCut.length > 0) {
      toast.error(t("NOT_ALLOWED_CUT_BOTH_CABLES_AND_TUBES"));
      return;
    }

    if (fiberCablesToCut.length === 0 && conduitsToCut.length === 0) {
      toast.error(t("NOTHING_SELECTED_TO_CUT"));
      return;
    }

    if (!localIdentifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const spanSegmentsToCut =
      fiberCablesToCut.length > 0 ? fiberCablesToCut : conduitsToCut;

    if (fiberCablesToCut.length > 0) {
      const confirmed = window.confirm(t("CONFIRATION_CUT_CABLE"));
      if (!confirmed) return;
    }

    const parameters: CutSpanSegmentsParameter = {
      routeNodeId: localIdentifiedFeature.id,
      spanSegmentsToCut: spanSegmentsToCut,
    };

    const { data } = await cutSpanSegmentsMutation(parameters);
    if (!data?.spanEquipment.cutSpanSegments.isSuccess) {
      toast.error(
        t(data?.spanEquipment.cutSpanSegments.errorCode ?? "Error has occured"),
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

    if (!localIdentifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: ConnectSpanSegmentsParameter = {
      routeNodeId: localIdentifiedFeature.id,
      spanSegmentsToConnect: spanSegmentsToConnect,
    };

    const { data } = await connectSpanSegmentsMutation(parameters);
    if (!data?.spanEquipment.connectSpanSegments.isSuccess) {
      toast.error(
        t(
          data?.spanEquipment.connectSpanSegments.errorCode ??
            "Error has occured",
        ),
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

    if (!localIdentifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: DisconnectSpanSegmentsParameter = {
      routeNodeId: localIdentifiedFeature.id,
      spanSegmentsToDisconnect: spanSegmentsToDisconnect,
    };

    const { data } = await disconnectSpanSegmentsMutation(parameters);
    if (!data?.spanEquipment.disconnectSpanSegments.isSuccess) {
      toast.error(
        t(
          data?.spanEquipment.disconnectSpanSegments.errorCode ??
            "Error has occured",
        ),
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

    if (!localIdentifiedFeature?.id) {
      toast.error(t("No identified feature"));
      return;
    }

    const parameters: DetachSpanEquipmentParameters = {
      routeNodeId: localIdentifiedFeature.id,
      spanSegmentIds: spanSegmentsIds,
    };

    const { data } = await detachSpanEquipmentMutation(parameters);
    if (!data?.spanEquipment.detachSpanEquipmentFromNodeContainer.isSuccess) {
      toast.error(
        t(
          data?.spanEquipment.detachSpanEquipmentFromNodeContainer.errorCode ??
            "Error has occurred",
        ),
      );
    }
  };

  const removeObject = async () => {
    if (!localIdentifiedFeature?.id) {
      toast.error("ERROR");
      console.error("Identified feature id was not set.");
      return;
    }

    const selectedObjects = currentlySelectedFeatures
      .filter((x) => {
        return (
          x.layer.source === "OuterConduit" ||
          x.layer.source === "InnerConduit" ||
          x.layer.source === "FiberCable" ||
          x.layer.source === "NodeContainer" ||
          x.layer.source === "Rack" ||
          x.layer.source === "TerminalEquipment"
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
      t("Are you sure you want to delete the selected object?"),
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
        toast.error(
          t(response.data?.nodeContainer.remove.errorCode ?? "ERROR"),
        );
      }
    } else if (
      objectToRemove.source === "OuterConduit" ||
      objectToRemove.source === "InnerConduit" ||
      objectToRemove.source === "FiberCable"
    ) {
      const response = await client
        .mutation<RemoveSpanStructureResponse>(REMOVE_SPAN_STRUCTURE, {
          spanSegmentId: objectToRemove.id,
        })
        .toPromise();

      if (!response.data?.spanEquipment.removeSpanStructure.isSuccess) {
        toast.error(
          t(
            response.data?.spanEquipment.removeSpanStructure.errorCode ??
              "ERROR",
          ),
        );
      }
    } else if (objectToRemove.source === "Rack") {
      const response = await client
        .mutation<RemoveRackFromNodeContainerResponse>(
          REMOVE_RACK_FROM_NODE_CONTAINER,
          {
            rackId: objectToRemove.id,
            routeNodeId: localIdentifiedFeature.id,
          } as RemoveRackFromNodeContainerParams,
        )
        .toPromise();

      if (!response.data?.nodeContainer.removeRackFromNodeContainer.isSuccess) {
        toast.error(
          t(
            response.data?.nodeContainer.removeRackFromNodeContainer
              .errorCode ?? "ERROR",
          ),
        );
      }
    } else if (objectToRemove.source === "TerminalEquipment") {
      const response = await client
        .mutation<RemoveTerminalEquipmentResponse>(REMOVE_TERMINAL_EQUIPMENT, {
          routeNodeId: localIdentifiedFeature.id,
          terminalEquipmentId: objectToRemove.id,
        } as RemoveTerminalEquipmentParams)
        .toPromise();

      if (!response.data?.terminalEquipment.remove.isSuccess) {
        toast.error(
          t(response.data?.terminalEquipment.remove.errorCode ?? "ERROR"),
        );
      }
    }
  };

  const currentlySelectedFeatures = useMemo(() => {
    return selectedFeatures.filter((x) => x.state?.selected);
  }, [selectedFeatures]);

  const traceFeatures = useCallback(
    async (features: MapGeoJSONFeature[]) => {
      const featuresToTrace = features.map((x) => x.properties?.refId);
      // If there are no features to trace we do not send the request
      // and clear the trace.
      if (!featuresToTrace || featuresToTrace.length === 0) {
        setTrace({ geometries: [], ids: [], etrs89: null, wgs84: null });
        return;
      }

      const traceResponse = await client
        .query<SpanSegmentTraceResponse>(SPAN_SEGMENT_TRACE, {
          spanSegmentIds: features.map((x) => x.properties?.refId),
        })
        .toPromise();

      const trace = traceResponse.data?.utilityNetwork.spanSegmentTrace;

      if (trace) {
        setTrace({
          geometries: trace.routeNetworkSegmentGeometries ?? [],
          ids: trace.routeNetworkSegmentIds ?? [],
          etrs89: enabledTracePan
            ? {
                maxX: trace.etrs89MaxX,
                maxY: trace.etrs89MaxY,
                minX: trace.etrs89MinX,
                minY: trace.etrs89MinY,
              }
            : null,
          wgs84: enabledTracePan
            ? {
                maxX: trace.wgs84MaxX,
                maxY: trace.wgs84MaxY,
                minX: trace.wgs84MinX,
                minY: trace.wgs84MinY,
              }
            : null,
        });
      }
    },
    [client, setTrace, enabledTracePan],
  );

  // Trace single
  useEffect(() => {
    if (editMode) return;

    if (
      singleSelectedFeature &&
      (singleSelectedFeature.state?.selected as boolean)
    ) {
      if (isTraceable(singleSelectedFeature)) {
        traceFeatures([singleSelectedFeature]);
      }
    } else {
      traceFeatures([]);
    }
  }, [singleSelectedFeature, editMode, traceFeatures]);

  // Trace multi
  useEffect(() => {
    if (!editMode) return;

    const traceables = currentlySelectedFeatures.filter((x) => isTraceable(x));
    traceFeatures(traceables).then(() => {});
  }, [editMode, traceFeatures, currentlySelectedFeatures]);

  const onSelectedFeature = useCallback(
    (feature: MapGeoJSONFeature) => {
      setSingleSelectedFeature(feature);
    },
    [setSingleSelectedFeature],
  );

  useEffect(() => {
    // This whole useeffect is a special case, this is needed to done because if not,
    // the schematic diagram dependency will keep reloading everytime a diagram object is being clicked.
    // This is mainly an issue because of mapbox not playing to nicely with the way react works so it rerenders the map.
    if (!singleSelectedFeature) return;

    if (editMode) {
      const foundIndex = selectedFeatures.findIndex(
        (x) =>
          x.properties?.refId === singleSelectedFeature.properties?.refId &&
          x.properties?.type === singleSelectedFeature.properties?.type,
      );

      if (foundIndex !== -1) {
        // This is very ugly.
        // In case the value has already been updated we return.
        // This is to avoid reload because it will reset mapbox.
        if (
          (selectedFeatures[foundIndex].state.selected as boolean) ===
          (singleSelectedFeature.state.selected as boolean)
        ) {
          return;
        } else {
          selectedFeatures[foundIndex] = singleSelectedFeature;
        }
      } else {
        selectedFeatures.push(singleSelectedFeature);
      }

      setSelectedFeatures([...selectedFeatures]);
    }
  }, [singleSelectedFeature, setSelectedFeatures, selectedFeatures, editMode]);

  useEffect(() => {
    if (showModals.addContainer) {
      showElement(
        addContainerModal(
          () => showModalsDispatch({ type: "addContainer", show: false }),
          t("ADD_NODE_CONTAINER"),
        ),
      );
    } else if (showModals.addInnerConduit) {
      showElement(
        addInnerConduitModal(
          () => showModalsDispatch({ type: "addInnerConduit", show: false }),
          t("ADD_INNER_CONDUIT"),
          currentlySelectedFeatures,
        ),
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
          localIdentifiedFeature?.id ?? "",
        ),
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
          currentlySelectedFeatures,
        ),
      );
    } else if (showModals.addTerminalEquipment) {
      showElement(
        addTerminalEquipmentModal(
          () =>
            showModalsDispatch({ type: "addTerminalEquipment", show: false }),
          t("ADD_TERMINAL_EQUIPMENT"),
          localIdentifiedFeature?.id ?? "",
          currentlySelectedFeatures,
        ),
      );
    } else if (showModals.outageView) {
      showElement(
        outageViewModal(
          () => showModalsDispatch({ type: "outageView", show: false }),
          t("OUTAGE_VIEW"),
          localIdentifiedFeature?.id ?? "",
        ),
      );
    } else if (showModals.arrangeRackEquipment) {
      if (!localIdentifiedFeature?.id) {
        throw Error("Could not get route network element id");
      }

      if (currentlySelectedFeatures.length !== 1) {
        throw Error(
          "The correct amount of selected items for arrange terminal equipment did not match.",
        );
      }

      const terminalEquipmentId =
        currentlySelectedFeatures[0]?.properties?.refId;
      if (!terminalEquipmentId) {
        throw Error("Could not get terminal equipment id.");
      }

      showElement(
        arrangeRackEquipmentModal(
          () =>
            showModalsDispatch({
              type: "arrangeRackEquipment",
              show: false,
            }),
          t("MOVE_EQUIPMENT_AS_WELL_AS_EVERYTHING_ABOVE_UP_OR_DOWN"),
          localIdentifiedFeature.id,
          terminalEquipmentId,
        ),
      );
    } else {
      showElement(null);
    }
  }, [
    showModals,
    localIdentifiedFeature?.id,
    t,
    currentlySelectedFeatures,
    showElement,
  ]);

  const reverseVertialAlignment = async () => {
    const nodeContainer = currentlySelectedFeatures.find(
      (x) => x.layer.source === "NodeContainerSide",
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
            .errorCode ?? "Error has occurred",
        ),
      );
    }
  };

  const affixSpanEquipmentToParent = async () => {
    const fiberCable = currentlySelectedFeatures.find(
      (x) => x.layer.source === "FiberCable",
    );

    const innerOrOuterConduit = currentlySelectedFeatures.find(
      (x) =>
        x.layer.source === "InnerConduit" || x.layer.source === "OuterConduit",
    );

    if (
      !localIdentifiedFeature?.id ||
      !fiberCable?.properties?.refId ||
      !innerOrOuterConduit?.properties?.refId
    ) {
      throw Error("Missing data to affix span equipment to parent");
    }

    const params: AffixSpanEquipmentToParentParams = {
      routeNodeId: localIdentifiedFeature.id,
      spanSegmentIdOne: fiberCable.properties.refId,
      spanSegmentIdTwo: innerOrOuterConduit.properties.refId,
    };

    const response = await client
      .mutation<AffixSpanEquipmentToParentResponse>(
        AFFIX_SPAN_EQUIPMENT_TO_PARENT,
        params,
      )
      .toPromise();

    if (!response.data?.spanEquipment.affixSpanEquipmentToParent.isSuccess) {
      toast.error(
        t(
          response.data?.spanEquipment.affixSpanEquipmentToParent.errorCode ??
            "ERROR",
        ),
      );
    }
  };

  const moveRackEquipment = async () => {
    if (!eligibleToMoveRackEquipment(currentlySelectedFeatures)) return;

    const freeRackSpace = currentlySelectedFeatures.find(
      (x) => x.source === "FreeRackSpace",
    );
    if (!freeRackSpace) {
      throw new Error("Could not get free rack space.");
    }

    const moveToRackPosition = freeRackSpace.properties?.position as
      | string
      | null
      | undefined;

    if (!moveToRackPosition) {
      throw new Error(
        "Could not get free rack space position from selected feature.",
      );
    }

    const moveToRackId = freeRackSpace.properties?.rackId as
      | string
      | null
      | undefined;

    if (!moveToRackId) {
      throw new Error("Could not get rack id on free rack space.");
    }

    const terminalEquipmentId = currentlySelectedFeatures.find(
      (x) => x.source === "TerminalEquipment",
    )?.properties?.refId;

    if (!terminalEquipmentId) {
      throw new Error(
        "Could not get terminal equipment id from selected feature.",
      );
    }

    if (!localIdentifiedFeature?.id) {
      throw new Error("Could not get route node id.");
    }

    const params: MoveRackEquipmentParams = {
      routeNodeId: localIdentifiedFeature.id,
      terminalEquipmentId: terminalEquipmentId,
      moveToRackId: moveToRackId,
      moveToRackPosition: parseInt(moveToRackPosition),
    };

    const response = await client
      .mutation<MoveRackEquipmentResponse>(MOVE_RACK_EQUIPMENT, params)
      .toPromise();

    if (!response.data?.nodeContainer.moveRackEquipment.isSuccess) {
      toast.error(
        t(response.data?.nodeContainer.moveRackEquipment.errorCode ?? "ERROR"),
      );
    }
  };

  const clearHighlights = () => {
    setTrace({ geometries: [], ids: [], etrs89: null, wgs84: null });
  };

  if (!localIdentifiedFeature?.id) {
    return <div></div>;
  }

  return (
    <div className="route-network-diagram">
      <FeatureInformation />

      {localIdentifiedFeature.type === "RouteNode" && (
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
                  currentlySelectedFeatures,
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
                  currentlySelectedFeatures,
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
                  !isSingleSelected(
                    "FreeRackSpace",
                    currentlySelectedFeatures,
                  ) &&
                  !isSingleSelected("NodeContainer", currentlySelectedFeatures),
                key: 2,
              },
            ]}
            title={t("ADD_NODE_CONTAINER")}
            disabled={!editMode}
          />
          <MultiOptionActionButton
            icon={MoveEquipmentSvg}
            actions={[
              {
                text: t("MOVE_TERMINAL_EQUIPMENT"),
                action: () => {
                  moveRackEquipment();
                },
                disabled: !eligibleToMoveRackEquipment(
                  currentlySelectedFeatures,
                ),
                key: 0,
              },
              {
                text: t(
                  "MOVE_EQUIPMENT_AS_WELL_AS_EVERYTHING_ABOVE_UP_OR_DOWN",
                ),
                action: () => {
                  showModalsDispatch({
                    type: "arrangeRackEquipment",
                    show: true,
                  });
                },
                disabled: !eligableToArrangeTerminalEquipment(
                  currentlySelectedFeatures,
                ),
                key: 1,
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
          <ToggleButton
            toggled={enabledTracePan}
            id={"0"}
            toggle={() => setEnabledTracePan(!enabledTracePan)}
            icon={ZoomMapSvg}
            title={t("TOGGLE_AUTOMATIC_ZOOM_MAP")}
          />
        </DiagramMenu>
      )}
      {localIdentifiedFeature.type === "RouteSegment" && (
        <DiagramMenu>
          <ActionButton
            icon={EraserSvg}
            action={() => clearHighlights()}
            title={t("CLEAR_HIGHLIGHT")}
          />
          <ActionButton
            icon={OutageSvg}
            action={() =>
              showModalsDispatch({ type: "outageView", show: true })
            }
            title={t("OUTAGE_VIEW")}
          />
          <ToggleButton
            toggled={enabledTracePan}
            id={"0"}
            toggle={() => setEnabledTracePan(!enabledTracePan)}
            icon={ZoomMapSvg}
            title={t("TOGGLE_AUTOMATIC_ZOOM_MAP")}
          />
        </DiagramMenu>
      )}
      <SchematicDiagram
        diagramObjects={diagramObjects}
        envelope={envelope}
        onSelectFeature={onSelectedFeature}
        editMode={editMode}
        routeElementId={localIdentifiedFeature.id}
      />
      {!editMode && singleSelectedFeature?.source === "NodeContainer" && (
        <NodeContainerDetails
          nodeContainerMrid={singleSelectedFeature?.properties?.refId ?? ""}
          showActions={true}
        />
      )}
      {!editMode &&
        singleSelectedFeature?.state?.selected &&
        (singleSelectedFeature?.source === "Rack" ||
          singleSelectedFeature?.source === "TerminalEquipment") && (
          <div className="container-max-size container-center">
            <TabView
              showFullScreenButton={true}
              selectedId={rackTabViewSelectedId}
              select={setRackTabViewSelectedId}
              key="0"
              views={
                singleSelectedFeature?.properties?.type ===
                "TerminalEquipmentWithProperties"
                  ? [
                      {
                        title: t("GENERAL"),
                        id: "0",
                        view: (
                          <GeneralTerminalEquipmentView
                            routeNodeId={localIdentifiedFeature?.id ?? ""}
                            terminalEquipmentId={
                              singleSelectedFeature.properties?.refId ?? ""
                            }
                            editable={true}
                          />
                        ),
                      },
                      {
                        title: t("CONNECTIVITY"),
                        id: "1",
                        view: (
                          <TerminalEquipment
                            routeNodeId={localIdentifiedFeature?.id ?? ""}
                            terminalEquipmentOrRackId={
                              singleSelectedFeature.properties?.refId ?? ""
                            }
                            editable={true}
                          />
                        ),
                      },
                    ]
                  : [
                      {
                        title: t("CONNECTIVITY"),
                        id: "0",
                        view: (
                          <TerminalEquipment
                            routeNodeId={localIdentifiedFeature?.id ?? ""}
                            terminalEquipmentOrRackId={
                              singleSelectedFeature.properties?.refId ?? ""
                            }
                            editable={true}
                          />
                        ),
                      },
                    ]
              }
            ></TabView>
          </div>
        )}
      {!editMode &&
        singleSelectedFeature?.state?.selected &&
        (singleSelectedFeature?.source === "FiberCable" ||
          singleSelectedFeature?.source.includes("Conduit")) && (
          <div className="container-max-size container-center">
            <TabView
              showFullScreenButton={true}
              selectedId={spanEquipmentTabViewSelectedId}
              select={setSpanEquipmentTabViewSelectedId}
              views={[
                {
                  title: t("GENERAL"),
                  view: (
                    <GeneralSpanEquipmentView
                      routeNetworkElementId={localIdentifiedFeature.id}
                      spanEquipmentId={singleSelectedFeature.properties?.refId}
                      editable={true}
                    />
                  ),
                  id: "0",
                },
                {
                  title: t("PASSAGE_VIEW"),
                  view: (
                    <PassageView
                      editable={true}
                      routeElementId={localIdentifiedFeature?.id ?? ""}
                      spanEquipmentOrSegmentIds={
                        singleSelectedFeature.properties?.refId ?? ""
                      }
                    />
                  ),
                  id: "1",
                },
                {
                  title: t("CONNECTIVITY"),
                  view: (
                    <ConnectivityView
                      routeNetworkElementId={localIdentifiedFeature?.id ?? ""}
                      spanEquipmentId={
                        singleSelectedFeature.properties?.refId ?? ""
                      }
                    />
                  ),
                  id: "2",
                },
              ]}
            />
          </div>
        )}
    </div>
  );
}

export default EditDiagram;
