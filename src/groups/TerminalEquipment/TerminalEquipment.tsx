import { useState, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faTrashAlt,
  faPlusCircle,
  faEdit,
  faPlug,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation, TFunction } from "react-i18next";
import {
  getTerminalEquipments,
  TerminalEquipment as TerminalEquipmentType,
  TerminalStructure,
  Line,
  ParentNodeStructure,
} from "./TerminalEquipmentGql";

type RackContainerProps = {
  children: ReactNode;
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
          <span
            role="button"
            className="header-icons__icon text-green"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faEdit} />
          </span>

          <span
            role="button"
            className="header-icons__icon text-green"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faPlusCircle} />
          </span>

          <span
            role="button"
            className="header-icons__icon text-red"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
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
          <span
            role="button"
            className="header-icons__icon text-green"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faEdit} />
          </span>
          <span
            role="button"
            className="header-icons__icon text-green"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faPlusCircle} />
          </span>

          <span
            role="button"
            className="header-icons__icon text-red"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
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
  return (
    <div className="table-item-terminal">
      <div
        role="button"
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
};

function TerminalLineFree({ t, line }: TerminalLineFreeProps) {
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
  t: TFunction;
};

function TerminalLine({ line }: TerminalLineProps) {
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
  showFreeLines: boolean;
  t: TFunction;
  terminalStructures: TerminalStructure[];
};

function TerminalEquipmentTable({
  showFreeLines,
  t,
  terminalStructures,
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

function TerminalEquipment() {
  const [showFreeLines, setShowFreeLines] = useState<{ [id: string]: boolean }>(
    {}
  );
  const { t } = useTranslation();
  const response = getTerminalEquipments();
  const groupedById = groupByParentId(response.terminalEquipments);

  const toggleShowFreeLines = (id: string) => {
    setShowFreeLines({ ...showFreeLines, [id]: !showFreeLines[id] });
  };

  return (
    <div className="terminal-equipment">
      {Object.keys(groupedById).map((x) => {
        return (
          <RackContainer
            parentNodeStructure={response.parentNodeStructures.find(
              (z) => z.id === x
            )}
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
    </div>
  );
}

export default TerminalEquipment;
