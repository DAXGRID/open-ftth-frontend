import { useEffect, useContext, ReactNode, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalContainer from "../../components/ModalContainer";
import FiberConnectionEditor from "../FiberConnectionEditor";
import { OverlayContext } from "../../contexts/OverlayContext";
import {
  faChevronRight,
  faPlusCircle,
  faEdit,
  faPlug,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import {
  TerminalEquipment as TerminalEquipmentType,
  TerminalStructure,
  Line,
  ParentNodeStructure,
} from "./TerminalEquipmentGql";
import {
  TerminalEquipmentProvider,
  TerminalEquipmentContext,
} from "./TerminalEquipmentContext";

type RackContainerProps = {
  children?: ReactNode;
  parentNodeStructure?: ParentNodeStructure;
};

function RackContainer({ children, parentNodeStructure }: RackContainerProps) {
  if (!parentNodeStructure) <></>;

  return (
    <div className="rack-container">
      <div className="rack-container-header">
        <p>{parentNodeStructure?.name}</p>
        <p>{parentNodeStructure?.specName}</p>
        <p>{parentNodeStructure?.info}</p>
        <div className="header-icons">
          <span role="button" className="header-icons__icon" onClick={() => {}}>
            <FontAwesomeIcon icon={faEdit} />
          </span>
          <span role="button" className="header-icons__icon" onClick={() => {}}>
            <FontAwesomeIcon icon={faPlusCircle} />
          </span>
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
  const { dispatch } = useContext(TerminalEquipmentContext);

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
          <span role="button" className="header-icons__icon" onClick={() => {}}>
            <FontAwesomeIcon icon={faEdit} />
          </span>
          <span role="button" className="header-icons__icon" onClick={() => {}}>
            <FontAwesomeIcon icon={faPlusCircle} />
          </span>
        </div>
      </div>
      <div className="terminal-equipment-table-container-body">{children}</div>
    </div>
  );
}

type PinPortProps = {
  line: Line;
};

function PinPort({ line }: PinPortProps) {
  const { dispatch } = useContext(TerminalEquipmentContext);

  return (
    <div className="table-item-terminal">
      <div
        role="button"
        onClick={() => dispatch({ type: "setShowFiberEditor", show: true })}
        className={
          line.a?.connectedTo
            ? "table-item-terminal__item text-red"
            : "table-item-terminal__item text-green"
        }
      >
        {line.a && <FontAwesomeIcon icon={faPlug} />}
      </div>
      <div className="table-item-terminal__item">{line.a?.terminal.name}</div>
      <div className="table-item-terminal__item">-O-</div>
      <div className="table-item-terminal__item">{line.z?.terminal.name}</div>
      <div
        role="button"
        onClick={() => dispatch({ type: "setShowFiberEditor", show: true })}
        className={
          line.z?.connectedTo
            ? "table-item-terminal__item text-red"
            : "table-item-terminal__item text-green"
        }
      >
        {line.z && <FontAwesomeIcon icon={faPlug} />}
      </div>
    </div>
  );
}

type TerminalLineFreeProps = {
  line: Line;
};

function TerminalLineFree({ line }: TerminalLineFreeProps) {
  const { t } = useTranslation();

  return (
    <div className="terminal-equipment-table-row">
      <div
        className="terminal-equipment-data-row
                terminal-equipment-table-grid-free"
      >
        {line.a ? (
          <div
            className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
          >
            {t("FREE")}
          </div>
        ) : (
          <div className="terminal-equipment-table-item"></div>
        )}
        <div className="terminal-equipment-table-item">
          <PinPort line={line} />
        </div>
        {line.z ? (
          <div
            className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
          >
            {t("FREE")}
          </div>
        ) : (
          <div className="terminal-equipment-table-item"></div>
        )}
      </div>
    </div>
  );
}

type TerminalLineProps = {
  line: Line;
};

function TerminalLine({ line }: TerminalLineProps) {
  const { dispatch } = useContext(TerminalEquipmentContext);

  return (
    <div className="terminal-equipment-table-row">
      <div className="terminal-equipment-data-row terminal-equipment-table-grid-equipped">
        <div className="terminal-equipment-table-item">
          <span
            className="terminal-equipment-table-item__icon"
            onClick={() =>
              dispatch({
                type: "setShowConnectivityTraceViews",
                id: line.a?.terminal.id ?? line.z?.terminal.id ?? "",
              })
            }
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </span>
          <span className="terminal-equipment-table-item__equipped">
            {line.a?.end}
          </span>
        </div>
        <div className="terminal-equipment-table-item">
          {line.a?.connectedTo}
        </div>
        <div className="terminal-equipment-table-item">
          <PinPort line={line} />
        </div>
        <div className="terminal-equipment-table-item">
          {line.z?.connectedTo}
        </div>
        <div className="terminal-equipment-table-item">{line.z?.end}</div>
      </div>
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
              {x.lines
                //.filter((t) => t.a?.connectedTo || t.z?.connectedTo)
                .map((y) => {
                  return (
                    <TerminalLine
                      line={y}
                      key={y.a?.terminal.id ?? y.z?.terminal.id}
                    />
                  );
                })}
              {/* {showFreeLines &&
                  x.lines
                  .filter((t) => !t.a?.connectedTo && !t.z?.connectedTo)
                  .map((y) => {
                  return (
                  <TerminalLineFree
                  line={y}
                  key={y.a?.terminal.id ?? y.z?.terminal.id}
                  />
                  );
                  })} */}
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

  /* const [connectivityTraceViewResponse] =
   *   useQuery<ConnectivityTraceViewResponse>({
   *     query: CONNECTIVITY_TRACE_VIEW_QUERY,
   *     variables: {
   *       routeNodeId: "79677dd6-77ce-4f7f-8cd5-152fba5caf28",
   *       terminalOrSpanEquipmentId: "79677dd6-77ce-4f7f-8cd5-152fba5caf28",
   *     } as ConnectivityTraceViewQueryParams,
   *   });
   */

  useEffect(() => {
    if (state.showFiberEditor) {
      showElement(
        <ModalContainer
          show={state.showFiberEditor}
          closeCallback={() =>
            dispatch({ type: "setShowFiberEditor", show: false })
          }
          maxWidth="1200px"
        >
          <FiberConnectionEditor />
        </ModalContainer>
      );
    } else {
      showElement(null);
    }
  }, [state.showFiberEditor, showElement, dispatch]);

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
}

function TerminalEquipmentWrapper({
  routeNodeId,
  terminalEquipmentOrRackId,
}: TerminalEquipmentWrapperProps) {
  return (
    <TerminalEquipmentProvider
      routeNodeId={routeNodeId}
      terminalEquipmentOrRackId={terminalEquipmentOrRackId}
    >
      <TerminalEquipment />
    </TerminalEquipmentProvider>
  );
}

export default TerminalEquipmentWrapper;
