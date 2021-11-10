import { useState, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faTrashAlt,
  faPlusCircle,
  faEdit,
  faPlug,
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
  editMode: boolean;
  toggleEditMode: () => void;
  terminalEquipment: TerminalEquipmentType;
};

function TerminalEquipmentTableContainer({
  children,
  editMode,
  toggleEditMode,
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
            className="header-icons__icon text-green"
            onClick={() => toggleEditMode()}
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

type TerminalStructureRow = {
  line: Line;
  t: TFunction;
};

function TerminalLine({ line }: TerminalStructureRow) {
  return (
    <>
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
            <div className="table-item-terminal">
              <div
                role="button"
                className={
                  line.a?.connectedTo
                    ? "table-item-terminal__item text-red"
                    : "table-item-terminal__item text-green"
                }
              >
                <FontAwesomeIcon icon={faPlug} />
              </div>

              <div className="table-item-terminal__item">
                {line.a?.terminal.name}
              </div>
              <div className="table-item-terminal__item">-O-</div>
              <div className="table-item-terminal__item">
                {line.z?.terminal.name}
              </div>

              <div
                role="button"
                className={
                  line.z?.connectedTo
                    ? "table-item-terminal__item text-red"
                    : "table-item-terminal__item text-green"
                }
              >
                <FontAwesomeIcon icon={faPlug} />
              </div>
            </div>
          </div>
          <div className="terminal-equipment-table-item">
            {line.z?.connectedTo}
          </div>
          <div className="terminal-equipment-table-item">{line.z?.end}</div>
        </div>
      </div>
    </>
  );
}

type TerminalEquipmentTableProps = {
  editMode: boolean;
  t: TFunction;
  terminalStructures: TerminalStructure[];
};

function TerminalEquipmentTable({
  editMode,
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

              {x.lines.map((y) => {
                return (
                  <TerminalLine
                    t={t}
                    line={y}
                    key={y.a?.terminal.id ?? y.z?.terminal.id}
                  />
                );
              })}
            </div>
          );
        })}

        {editMode && (
          <>
            <div className="terminal-equipment-table-row">
              <div
                className="terminal-equipment-data-row
                terminal-equipment-table-grid-free"
              >
                <div
                  className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
                >
                  {t("FREE")}
                </div>
                <div className="terminal-equipment-table-item">3</div>
                <div
                  className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
                >
                  {t("FREE")}
                </div>
              </div>
            </div>
            <div className="terminal-equipment-table-row">
              <div
                className="terminal-equipment-data-row
                terminal-equipment-table-grid-free"
              >
                <div
                  className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
                >
                  {t("FREE")}
                </div>
                <div className="terminal-equipment-table-item">4</div>
                <div
                  className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
                >
                  {t("FREE")}
                </div>
              </div>
            </div>
            <div className="terminal-equipment-table-row">
              <div
                className="terminal-equipment-data-row
                terminal-equipment-table-grid-free"
              >
                <div
                  className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
                >
                  {t("FREE")}
                </div>
                <div className="terminal-equipment-table-item">5</div>
                <div
                  className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
                >
                  {t("FREE")}
                </div>
              </div>
            </div>
          </>
        )}
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
  const [editMode, setEditMode] = useState(false);
  const { t } = useTranslation();
  const response = getTerminalEquipments();
  const groupedById = groupByParentId(response.terminalEquipments);

  const toggleEditMode = () => {
    setEditMode(!editMode);
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
                  editMode={editMode}
                  toggleEditMode={toggleEditMode}
                  terminalEquipment={y}
                >
                  <TerminalEquipmentTable
                    editMode={editMode}
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
