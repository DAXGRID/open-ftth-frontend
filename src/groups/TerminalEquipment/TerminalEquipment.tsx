import {
  faEdit,
  faFilter,
  faPlus,
  faTrashAlt,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ModalContainer from "../../components/ModalContainer";
import { MapContext } from "../../contexts/MapContext";
import { OverlayContext } from "../../contexts/OverlayContext";
import FiberConnectionEditor from "../FiberConnectionEditor";
import {
  TerminalEquipmentContext,
  TerminalEquipmentProvider,
} from "./TerminalEquipmentContext";
import {
  ParentNodeStructure,
  TerminalEquipment as TerminalEquipmentType,
  TerminalStructure,
} from "./TerminalEquipmentGql";
import TerminalLine from "./TerminalLine";
import TerminalLineFree from "./TerminalLineFree";
import DisconnectFiberEditor from "./DisconnectFiberEditor";
import EditTerminalEquipment from "./EditTerminalEquipment";
import EditRack from "./EditRack";
import AddAdditionalStructures from "./AddAdditionalStructures";
import OutageView from "../RouteNetworkDiagram/OutageView";
import EditInterface from "./EditInterface";

type RackContainerProps = {
  children?: ReactNode;
  parentNodeStructure?: ParentNodeStructure;
};

function RackContainer({ children, parentNodeStructure }: RackContainerProps) {
  const { state, dispatch } = useContext(TerminalEquipmentContext);
  if (!parentNodeStructure) return <></>;

  return (
    <div className="rack-container">
      <div className="rack-container-header">
        <p>{parentNodeStructure?.name ?? ""}</p>
        {parentNodeStructure?.specName && (
          <p>{parentNodeStructure?.specName ?? ""}</p>
        )}
        {parentNodeStructure?.info && <p>{parentNodeStructure?.info ?? ""}</p>}
        <div className="header-icons">
          {state.editable && (
            <span
              role="button"
              className="header-icons__icon"
              onClick={() =>
                dispatch({
                  type: "setShowOutageView",
                  show: {
                    routeNodeId: state.routeNodeId,
                    equipmentId: parentNodeStructure.id,
                    show: true,
                  },
                })
              }
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </span>
          )}
          {state.editable && (
            <span
              role="button"
              className="header-icons__icon"
              onClick={() =>
                dispatch({
                  type: "setShowEditRack",
                  show: {
                    routeNodeId: state.routeNodeId,
                    rackId: parentNodeStructure.id,
                    show: true,
                  },
                })
              }
            >
              <FontAwesomeIcon icon={faEdit} />
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

type TerminalEquipmentTableContainerProps = {
  children: ReactNode;
  terminalEquipment: TerminalEquipmentType;
  showFreeLines: boolean;
};

function TerminalEquipmentTableContainer({
  children,
  terminalEquipment,
  showFreeLines,
}: TerminalEquipmentTableContainerProps) {
  const { state, dispatch } = useContext(TerminalEquipmentContext);

  return (
    <div className="terminal-equipment-table-container">
      <div className="terminal-equipment-table-container-header">
        <p>{terminalEquipment.name}</p>
        <p>{terminalEquipment.specName}</p>
        {terminalEquipment.info && <p>{terminalEquipment.info}</p>}
        <div className="header-icons">
          <span
            role="button"
            className={
              showFreeLines
                ? "header-icons__icon"
                : "header-icons__icon text-green"
            }
            onClick={() =>
              dispatch({ type: "setShowFreeLines", id: terminalEquipment.id })
            }
          >
            <FontAwesomeIcon icon={faFilter} />
          </span>
          {state.editable && (
            <>
              <span
                role="button"
                className="header-icons__icon"
                onClick={() =>
                  dispatch({
                    type: "setShowEditTerminalEquipment",
                    show: {
                      show: true,
                      terminalEquipmentId: terminalEquipment.id,
                    },
                  })
                }
              >
                <FontAwesomeIcon icon={faEdit} />
              </span>
              <span
                role="button"
                className="header-icons__icon"
                onClick={() =>
                  dispatch({
                    show: {
                      routeNodeId: state.routeNodeId,
                      show: true,
                      terminalEquipmentId: terminalEquipment.id,
                      isLineTermination: terminalEquipment.isLineTermination,
                    },
                    type: "setShowAddAdditionalStructures",
                  })
                }
              >
                <FontAwesomeIcon icon={faPlus} />
              </span>
              <span
                role="button"
                className="header-icons__icon"
                onClick={() =>
                  dispatch({
                    show: {
                      routeNodeId: state.routeNodeId,
                      show: true,
                      equipmentId: terminalEquipment.id,
                    },
                    type: "setShowOutageView",
                  })
                }
              >
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </span>
            </>
          )}
        </div>
      </div>
      <div className="terminal-equipment-table-container-body">{children}</div>
    </div>
  );
}

type TerminalEquipmentTableProps = {
  terminalStructures: TerminalStructure[];
  showFreeLines: boolean;
  terminalEquipmentId: string;
  isRack: boolean;
  isLineTermination: boolean;
};

function TerminalEquipmentTable({
  terminalStructures,
  showFreeLines,
  terminalEquipmentId,
  isRack,
  isLineTermination,
}: TerminalEquipmentTableProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(TerminalEquipmentContext);

  return (
    <div className="terminal-equipment-table">
      <div
        className="terminal-equipment-header
        terminal-equipment-table-row
        terminal-equipment-table-grid-header"
      >
        <div className="terminal-equipment-table-item">{t("A-INFO")}</div>
        <div className="terminal-equipment-table-item">{t("FROM")}</div>
        <div className="terminal-equipment-table-item">{t("PIN/PORT")}</div>
        <div className="terminal-equipment-table-item">{t("TO")}</div>
        <div className="terminal-equipment-table-item">{t("Z-INFO")}</div>
      </div>
      <div
        className={`terminal-equipment-table-body ${
          isRack ? "terminal-equipment-table-body--rack" : ""
        }`}
      >
        {terminalStructures.map((x) => {
          return (
            <div key={x.id}>
              <div className="terminal-equipment-table-row">
                <div className="terminal-equipment-header-row">
                  <p className="terminal-equipment-row-header__item">
                    {x.name}
                  </p>
                  <p className="terminal-equipment-row-header__item">
                    {x.specName}
                  </p>
                  <p className="terminal-equipment-row-header__item">
                    {x.info}
                  </p>
                  {state.editable && (
                    <div className="header-icons ">
                      {isLineTermination && (
                        <span
                          role="button"
                          className="header-icons__icon"
                          onClick={() =>
                            dispatch({
                              type: "setShowEditInterfaceView",
                              showEditInterfaceView: {
                                show: true,
                                routeNodeId: state.routeNodeId ?? "",
                                terminalEquipmentId: terminalEquipmentId,
                                terminalStructureId: x.id,
                              },
                            })
                          }
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </span>
                      )}
                      <span
                        role="button"
                        className="header-icons__icon color-red"
                        onClick={() =>
                          dispatch({
                            type: "removeStructure",
                            params: {
                              terminalEquipmentId: terminalEquipmentId,
                              terminalStructureId: x.id,
                            },
                          })
                        }
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="terminal-equipment-body-rows">
                {x.lines.map((y, i) => {
                  if (y.a?.connectedTo || y.z?.connectedTo) {
                    return (
                      <TerminalLine
                        line={y}
                        key={y.a?.terminal.id ?? y.z?.terminal.id}
                        terminalEquipmentOrRackId={terminalEquipmentId}
                      />
                    );
                  } else if (
                    showFreeLines &&
                    !y.a?.connectedTo &&
                    !y.z?.connectedTo
                  ) {
                    return (
                      <TerminalLineFree
                        line={y}
                        key={i}
                        terminalEquipmentOrRackId={terminalEquipmentId}
                      />
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function groupByParentId(terminalEquipments: TerminalEquipmentType[]): {
  [name: string]: TerminalEquipmentType[];
} {
  return terminalEquipments.reduce<{
    [name: string]: TerminalEquipmentType[];
  }>((acc, v) => {
    if (acc[v.parentNodeStructureId]) {
      return {
        ...acc,
        [v.parentNodeStructureId]: [...acc[v.parentNodeStructureId], v],
      };
    } else {
      return { ...acc, [v.parentNodeStructureId]: [v] };
    }
  }, {});
}

function TerminalEquipment() {
  const { showElement } = useContext(OverlayContext);
  const { dispatch, state } = useContext(TerminalEquipmentContext);
  const { t } = useTranslation();
  const { identifiedFeature } = useContext(MapContext);

  useEffect(() => {
    if (state.showFiberEditor.show) {
      if (
        identifiedFeature?.id &&
        state.showFiberEditor.terminalId &&
        state.showFiberEditor.terminalEquipmentOrRackId
      ) {
        showElement(
          <ModalContainer
            title={t("FIBER_CONNECTION_EDITOR")}
            closeCallback={() =>
              dispatch({
                type: "resetShowFiberEditor",
              })
            }
            maxWidth="1200px"
          >
            <FiberConnectionEditor
              routeNodeId={identifiedFeature.id}
              faceKind={
                state.showFiberEditor.faceKind as "PATCH_SIDE" | "SPLICE_SIDE"
              }
              terminalId={state.showFiberEditor.terminalId}
              terminalEquipmentOrRackId={
                state.showFiberEditor.terminalEquipmentOrRackId
              }
              side={state.showFiberEditor.side}
            />
          </ModalContainer>,
        );
      } else {
        throw Error("Did not have all information to show fiber editor.");
      }
    } else {
      showElement(null);
    }
  }, [state.showFiberEditor, showElement, dispatch, t, identifiedFeature]);

  useEffect(() => {
    if (
      state.showDisconnectFiberEditor.show &&
      state.showDisconnectFiberEditor.connectedToSegmentId &&
      state.showDisconnectFiberEditor.terminalId &&
      state.routeNodeId
    ) {
      showElement(
        <ModalContainer
          title={t("DISCONNECT")}
          closeCallback={() =>
            dispatch({
              type: "resetShowDisconnectFiberEditor",
            })
          }
          maxWidth="1200px"
        >
          <DisconnectFiberEditor
            spanSegmentId={state.showDisconnectFiberEditor.connectedToSegmentId}
            terminalId={state.showDisconnectFiberEditor.terminalId}
            routeNodeId={state.routeNodeId}
            disconnectCallback={() =>
              dispatch({
                type: "resetShowDisconnectFiberEditor",
              })
            }
          />
        </ModalContainer>,
      );
    } else if (
      state.showEditTerminalEquipment.show &&
      state.showEditTerminalEquipment.terminalEquipmentId &&
      state.routeNodeId
    ) {
      showElement(
        <ModalContainer
          title={t("EDIT_TERMINAL_EQUIPMENT")}
          closeCallback={() =>
            dispatch({
              type: "resetShowEditTerminalEquipment",
            })
          }
        >
          <EditTerminalEquipment
            terminalEquipmentId={
              state.showEditTerminalEquipment.terminalEquipmentId
            }
            routeNodeId={state.routeNodeId}
          />
        </ModalContainer>,
      );
    } else if (
      state.showEditRack.show &&
      state.showEditRack.rackId &&
      state.showEditRack.routeNodeId
    ) {
      showElement(
        <ModalContainer
          title={t("EDIT_RACK")}
          closeCallback={() => dispatch({ type: "resetShowEditRack" })}
        >
          <EditRack
            rackId={state.showEditRack.rackId}
            routeNodeId={state.showEditRack.routeNodeId}
          />
        </ModalContainer>,
      );
    } else if (
      state.showAddAdditionalStructure.show &&
      state.showAddAdditionalStructure.routeNodeId &&
      state.showAddAdditionalStructure.terminalEquipmentId
    ) {
      showElement(
        <ModalContainer
          title={t("ADD_ADDITIONAL_STRUCTURES")}
          closeCallback={() =>
            dispatch({ type: "resetShowAddAdditionalStructures" })
          }
        >
          <AddAdditionalStructures
            addedSuccessCallback={() =>
              dispatch({
                type: "resetShowAddAdditionalStructures",
              })
            }
            routeNodeId={state.showAddAdditionalStructure.routeNodeId}
            isLineTermination={
              state.showAddAdditionalStructure.isLineTermination
            }
            terminalEquipmentId={
              state.showAddAdditionalStructure.terminalEquipmentId
            }
          />
        </ModalContainer>,
      );
    } else if (
      state.showOutageView.show &&
      state.showOutageView.routeNodeId &&
      state.showOutageView.equipmentId
    ) {
      showElement(
        <ModalContainer
          title={t("OUTAGE_VIEW")}
          closeCallback={() => dispatch({ type: "resetShowOutageView" })}
        >
          <OutageView
            routeElementId={state.showOutageView.routeNodeId}
            equipmentId={state.showOutageView.equipmentId}
          />
        </ModalContainer>,
      );
    } else if (
      state.showEditInterfaceView?.show &&
      state.showEditInterfaceView.terminalEquipmentId &&
      state.showEditInterfaceView.terminalStructureId &&
      state.showEditInterfaceView.routeNodeId
    ) {
      showElement(
        <ModalContainer
          title={t("EDIT_INTERFACE")}
          closeCallback={() => dispatch({ type: "resetShowEditInterfaceView" })}
        >
          <EditInterface />
        </ModalContainer>,
      );
    } else {
      showElement(null);
    }
  }, [
    state.showDisconnectFiberEditor,
    state.connectivityView?.terminalEquipments,
    state.routeNodeId,
    state.showEditTerminalEquipment,
    state.terminalEquipmentOrRackId,
    state.showEditRack,
    state.showAddAdditionalStructure,
    state.showOutageView,
    state.showEditInterfaceView,
    showElement,
    dispatch,
    t,
  ]);

  const groupedByParentId = useMemo(() => {
    return groupByParentId(state.connectivityView?.terminalEquipments ?? []);
  }, [state.connectivityView?.terminalEquipments]);

  return (
    <div className="terminal-equipment">
      {state.connectivityView?.parentNodeStructures &&
        Object.keys(groupedByParentId).length === 0 && (
          <RackContainer
            parentNodeStructure={
              state.connectivityView?.parentNodeStructures[0]
            }
          ></RackContainer>
        )}
      {state.connectivityView?.parentNodeStructures &&
        Object.keys(groupedByParentId).map((x) => {
          return (
            <RackContainer
              parentNodeStructure={state.connectivityView?.parentNodeStructures.find(
                (z) => z.id === x,
              )}
              key={x}
            >
              {groupedByParentId[x].map((y) => {
                return (
                  <TerminalEquipmentTableContainer
                    showFreeLines={state.showFreeLines[y.id] ?? false}
                    key={y.id}
                    terminalEquipment={y}
                  >
                    <TerminalEquipmentTable
                      terminalEquipmentId={y.id}
                      terminalStructures={y.terminalStructures}
                      showFreeLines={state.showFreeLines[y.id] ?? false}
                      isRack={true}
                      isLineTermination={y.isLineTermination}
                    />
                  </TerminalEquipmentTableContainer>
                );
              })}
            </RackContainer>
          );
        })}
      {!state.connectivityView?.parentNodeStructures &&
        Object.keys(groupedByParentId).map((x) => {
          return groupedByParentId[x].map((y) => {
            return (
              <TerminalEquipmentTableContainer
                key={y.id}
                terminalEquipment={y}
                showFreeLines={state.showFreeLines[y.id]}
              >
                <TerminalEquipmentTable
                  terminalEquipmentId={y.id}
                  terminalStructures={y.terminalStructures}
                  showFreeLines={state.showFreeLines[y.id] ?? false}
                  isRack={false}
                  isLineTermination={y.isLineTermination}
                />
              </TerminalEquipmentTableContainer>
            );
          });
        })}
    </div>
  );
}

interface TerminalEquipmentWrapperProps {
  routeNodeId: string;
  terminalEquipmentOrRackId: string;
  editable: boolean;
}

function TerminalEquipmentWrapper({
  routeNodeId,
  terminalEquipmentOrRackId,
  editable,
}: TerminalEquipmentWrapperProps) {
  return (
    <TerminalEquipmentProvider
      routeNodeId={routeNodeId}
      terminalEquipmentOrRackId={terminalEquipmentOrRackId}
      editable={editable}
    >
      <TerminalEquipment />
    </TerminalEquipmentProvider>
  );
}

export default TerminalEquipmentWrapper;
