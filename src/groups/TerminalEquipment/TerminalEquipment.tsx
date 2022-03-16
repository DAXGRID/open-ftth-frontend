import {
  faEdit,
  faFilter,
  faPlusCircle,
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

type RackContainerProps = {
  children?: ReactNode;
  parentNodeStructure?: ParentNodeStructure;
};

function RackContainer({ children, parentNodeStructure }: RackContainerProps) {
  const { state } = useContext(TerminalEquipmentContext);
  if (!parentNodeStructure) <></>;

  return (
    <div className="rack-container">
      <div className="rack-container-header">
        <p>{parentNodeStructure?.name ?? ""}</p>
        <p>{parentNodeStructure?.specName ?? ""}</p>
        <p>{parentNodeStructure?.info ?? ""}</p>
        <div className="header-icons">
          {state.editable && (
            <>
              <span
                role="button"
                className="header-icons__icon"
                onClick={() => {}}
              >
                <FontAwesomeIcon icon={faEdit} />
              </span>
            </>
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
        <p>{terminalEquipment.info}</p>
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
                onClick={() => {}}
              >
                <FontAwesomeIcon
                  icon={faEdit}
                  onClick={() => {
                    dispatch({
                      type: "setShowEditTerminalEquipment",
                      show: {
                        show: true,
                        terminalEquipmentId: terminalEquipment.id,
                      },
                    });
                  }}
                />
              </span>
              <span
                role="button"
                className="header-icons__icon"
                onClick={() => {}}
              >
                <FontAwesomeIcon icon={faPlusCircle} />
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
  terminalEquipmentOrRackId: string;
};

function TerminalEquipmentTable({
  terminalStructures,
  showFreeLines,
  terminalEquipmentOrRackId,
}: TerminalEquipmentTableProps) {
  const { t } = useTranslation();

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
      <div className="terminal-equipment-table-body">
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
                  <p className="terminal-equipment-row-header__item"></p>
                </div>
              </div>
              {x.lines.map((y, i) => {
                if (y.a?.connectedTo || y.z?.connectedTo) {
                  return (
                    <TerminalLine
                      line={y}
                      key={y.a?.terminal.id ?? y.z?.terminal.id}
                      terminalEquipmentOrRackId={terminalEquipmentOrRackId}
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
                      terminalEquipmentOrRackId={terminalEquipmentOrRackId}
                    />
                  );
                } else {
                  return null;
                }
              })}
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
          </ModalContainer>
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
          title={t("DISCONNECT_FIBER_CABLE")}
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
          />
        </ModalContainer>
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
        </ModalContainer>
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
                (z) => z.id === x
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
                      terminalEquipmentOrRackId={y.id}
                      terminalStructures={y.terminalStructures}
                      showFreeLines={state.showFreeLines[y.id] ?? false}
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
                  terminalEquipmentOrRackId={y.id}
                  terminalStructures={y.terminalStructures}
                  showFreeLines={state.showFreeLines[y.id] ?? false}
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
