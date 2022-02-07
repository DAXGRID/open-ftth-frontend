import { useEffect, useContext, ReactNode, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalContainer from "../../components/ModalContainer";
import FiberConnectionEditor from "../FiberConnectionEditor";
import { OverlayContext } from "../../contexts/OverlayContext";
import {
  faPlusCircle,
  faEdit,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import {
  TerminalEquipment as TerminalEquipmentType,
  TerminalStructure,
  ParentNodeStructure,
} from "./TerminalEquipmentGql";
import {
  TerminalEquipmentProvider,
  TerminalEquipmentContext,
} from "./TerminalEquipmentContext";
import TerminalLine from "./TerminalLine";
import TerminalLineFree from "./TerminalLineFree";
import { MapContext } from "../../contexts/MapContext";

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
        <p>{parentNodeStructure?.name}</p>
        <p>{parentNodeStructure?.specName}</p>
        <p>{parentNodeStructure?.info}</p>
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
                <FontAwesomeIcon icon={faEdit} />
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
};

function TerminalEquipmentTable({
  terminalStructures,
  showFreeLines,
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
                    />
                  );
                } else if (
                  showFreeLines &&
                  !y.a?.connectedTo &&
                  !y.z?.connectedTo
                ) {
                  return <TerminalLineFree line={y} key={i} />;
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
      showElement(
        <ModalContainer
          title={t("FIBER_CONNECTION_EDITOR")}
          show={state.showFiberEditor.show}
          closeCallback={() =>
            dispatch({
              type: "setShowFiberEditor",
              show: {
                show: false,
                terminalId: null,
                faceKind: null,
                side: null,
              },
            })
          }
          maxWidth="1200px"
        >
          <FiberConnectionEditor
            routeNodeId={identifiedFeature?.id ?? ""}
            faceKind={
              state.showFiberEditor.faceKind as "PATCH_SIDE" | "SPLICE_SIDE"
            }
            terminalId={state.showFiberEditor.terminalId}
            terminalEquipmentOrRackId={state.terminalEquipmentOrRackId}
            side={state.showFiberEditor.side}
          />
        </ModalContainer>
      );
    } else {
      showElement(null);
    }
  }, [
    state.showFiberEditor,
    state.terminalEquipmentOrRackId,
    showElement,
    dispatch,
    t,
    identifiedFeature,
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
