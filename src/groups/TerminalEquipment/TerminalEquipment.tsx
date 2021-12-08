import { useState, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "urql";
import ModalContainer from "../../components/ModalContainer";
import FiberConnectionEditor from "../FiberConnectionEditor";
import {
  faChevronRight,
  faPlusCircle,
  faEdit,
  faPlug,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation, TFunction } from "react-i18next";
import {
  TerminalEquipment as TerminalEquipmentType,
  TerminalStructure,
  Line,
  ParentNodeStructure,
  TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_QUERY,
  TerminalEquipmentResponse,
} from "./TerminalEquipmentGql";

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
  toggleShowFreeLines: (id: string) => void;
  showFreeLines: boolean;
  terminalEquipment: TerminalEquipmentType;
};

function TerminalEquipmentTableContainer({
  children,
  toggleShowFreeLines,
  showFreeLines,
  terminalEquipment,
}: TerminalEquipmentTableContainerProps) {
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
            onClick={() => toggleShowFreeLines(terminalEquipment.id)}
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
  action: () => void;
};

function PinPort({ line, action }: PinPortProps) {
  return (
    <div className="table-item-terminal">
      <div
        role="button"
        onClick={action}
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
        onClick={action}
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
  t: TFunction;
  action: () => void;
};

function TerminalLineFree({ t, line, action }: TerminalLineFreeProps) {
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
          <PinPort action={action} line={line} />
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
  t: TFunction;
  action: () => void;
};

function TerminalLine({ line, action }: TerminalLineProps) {
  return (
    <div className="terminal-equipment-table-row">
      <div className="terminal-equipment-data-row terminal-equipment-table-grid-equipped">
        <div className="terminal-equipment-table-item">
          <span className="terminal-equipment-table-item__icon">
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
          <PinPort action={action} line={line} />
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
  showFreeLines: boolean;
  t: TFunction;
  terminalStructures: TerminalStructure[];
  action: () => void;
};

function TerminalEquipmentTable({
  showFreeLines,
  t,
  terminalStructures,
  action,
}: TerminalEquipmentTableProps) {
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
                .filter((t) => t.a?.connectedTo || t.z?.connectedTo)
                .map((y) => {
                  return (
                    <TerminalLine
                      action={action}
                      t={t}
                      line={y}
                      key={y.a?.terminal.id ?? y.z?.terminal.id}
                    />
                  );
                })}

              {showFreeLines &&
                x.lines
                  .filter((t) => !t.a?.connectedTo && !t.z?.connectedTo)
                  .map((y) => {
                    return (
                      <TerminalLineFree
                        action={action}
                        t={t}
                        line={y}
                        key={y.a?.terminal.id ?? y.z?.terminal.id}
                      />
                    );
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

interface TerminalEquipmentProps {
  routeNodeId: string;
  terminalEquipmentOrRackId: string;
}

function TerminalEquipment({
  routeNodeId,
  terminalEquipmentOrRackId,
}: TerminalEquipmentProps) {
  const [showFreeLines, setShowFreeLines] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [showFiberEditor, setShowFiberEditor] = useState<boolean>(false);

  const { t } = useTranslation();

  const [response] = useQuery<TerminalEquipmentResponse>({
    query: TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_QUERY,
    variables: {
      routeNodeId: routeNodeId,
      terminalEquipmentOrRackId: terminalEquipmentOrRackId,
    },
    pause: !routeNodeId || !terminalEquipmentOrRackId,
  });

  const groupedById = groupByParentId(
    response.data?.utilityNetwork.terminalEquipmentConnectivityView
      ?.terminalEquipments ?? []
  );

  const toggleShowFreeLines = (id: string) => {
    setShowFreeLines({ ...showFreeLines, [id]: !showFreeLines[id] });
  };

  const parentNodeStructures =
    response.data?.utilityNetwork.terminalEquipmentConnectivityView
      .parentNodeStructures;

  return (
    <div className="terminal-equipment">
      {showFiberEditor && (
        <ModalContainer
          show={showFiberEditor}
          closeCallback={() => setShowFiberEditor(false)}
          maxWidth="1200px"
        >
          <FiberConnectionEditor />
        </ModalContainer>
      )}
      {parentNodeStructures && Object.keys(groupedById).length === 0 && (
        <RackContainer
          parentNodeStructure={parentNodeStructures[0]}
        ></RackContainer>
      )}
      {parentNodeStructures &&
        Object.keys(groupedById).map((x) => {
          return (
            <RackContainer
              parentNodeStructure={parentNodeStructures.find((z) => z.id === x)}
              key={x}
            >
              {groupedById[x].map((y) => {
                return (
                  <TerminalEquipmentTableContainer
                    key={y.id}
                    toggleShowFreeLines={toggleShowFreeLines}
                    terminalEquipment={y}
                    showFreeLines={showFreeLines[y.id] ?? false}
                  >
                    <TerminalEquipmentTable
                      action={() => setShowFiberEditor(true)}
                      showFreeLines={showFreeLines[y.id] ?? false}
                      t={t}
                      terminalStructures={y.terminalStructures}
                    />
                  </TerminalEquipmentTableContainer>
                );
              })}
            </RackContainer>
          );
        })}
      {!parentNodeStructures &&
        Object.keys(groupedById).map((x) => {
          return groupedById[x].map((y) => {
            return (
              <TerminalEquipmentTableContainer
                key={y.id}
                toggleShowFreeLines={toggleShowFreeLines}
                terminalEquipment={y}
                showFreeLines={showFreeLines[y.id] ?? false}
              >
                <TerminalEquipmentTable
                  action={() => setShowFiberEditor(true)}
                  showFreeLines={showFreeLines[y.id] ?? false}
                  t={t}
                  terminalStructures={y.terminalStructures}
                />
              </TerminalEquipmentTableContainer>
            );
          });
        })}
    </div>
  );
}

export default TerminalEquipment;
