import { useState, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faPen } from "@fortawesome/free-solid-svg-icons";
import { useTranslation, TFunction } from "react-i18next";
import {
  getTerminalEquipments,
  TerminalEquipment as TerminalEquipmentType,
  TerminalStructure,
  Line,
} from "./TerminalEquipmentGql";

type TerminalEquipmentTableContainerProps = {
  children: ReactNode;
  editMode: boolean;
  toggleEditMode: () => void;
  t: TFunction;
  terminalEquipment: TerminalEquipmentType;
};

function TerminalEquipmentTableContainer({
  children,
  editMode,
  toggleEditMode,
  t,
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
              editMode
                ? "header-icons__icon header-icons__icon--selected"
                : "header-icons__icon"
            }
            onClick={() => toggleEditMode()}
          >
            <FontAwesomeIcon icon={faPen} />
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
            {line.a?.terminal.name} -O- {line.z?.terminal.name}
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

function TerminalEquipment() {
  const [editMode, setEditMode] = useState(false);
  const { t } = useTranslation();
  const response = getTerminalEquipments();

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div className="terminal-equipment">
      {response.terminalEquipments.map((x) => {
        return (
          <TerminalEquipmentTableContainer
            key={x.id}
            t={t}
            editMode={editMode}
            toggleEditMode={toggleEditMode}
            terminalEquipment={x}
          >
            <TerminalEquipmentTable
              editMode={editMode}
              t={t}
              terminalStructures={x.terminalStructures}
            />
          </TerminalEquipmentTableContainer>
        );
      })}
    </div>
  );
}

export default TerminalEquipment;
