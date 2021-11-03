import { useState, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faPen } from "@fortawesome/free-solid-svg-icons";
import { useTranslation, TFunction } from "react-i18next";
import {
  getTerminalEquipments,
  TerminalEquipment as TerminalEquipmentType,
  TerminalStructure,
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
        <p>{t("RACK_POSITION", { position: terminalEquipment.name })}</p>
        <p>
          {t("TYPE")}: {terminalEquipment.specName}
        </p>
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
        <div className="terminal-equipment-table-row">
          <div className="terminal-equipment-header-row">
            <p className="terminal-equipment-row-header__item">1</p>
            <p className="terminal-equipment-row-header__item">
              12 soems bred splidsebakke
            </p>
            <p className="terminal-equipment-row-header__item">
              {t("TERMINAL_EQUIPMENT_PLACES_USED", { used: 2, total: 12 })}
            </p>
          </div>
        </div>

        <div className="terminal-equipment-table-row">
          <div className="terminal-equipment-data-row terminal-equipment-table-grid-equipped">
            <div className="terminal-equipment-table-item">
              <span className="terminal-equipment-table-item__icon">
                <FontAwesomeIcon icon={faChevronRight} />
              </span>
              <span className="terminal-equipment-table-item__equipped">
                GALAH-ODF 1-3-1 WDM 1-4-1 OLT-1-1-1
              </span>
            </div>
            <div className="terminal-equipment-table-item">
              K102034 (72) Fiber 1
            </div>
            <div className="terminal-equipment-table-item">1 -O-</div>
            <div className="terminal-equipment-table-item">
              Splitter 1 (1:32) Ind 1
            </div>
            <div className="terminal-equipment-table-item">
              {t("TOTAL_INSTALLATIONS_PORTS_FREE", {
                installations: 29,
                freePorts: 3,
              })}
            </div>
          </div>
        </div>

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
            <TerminalEquipmentTable editMode={editMode} t={t} />
          </TerminalEquipmentTableContainer>
        );
      })}
    </div>
  );
}

export default TerminalEquipment;
