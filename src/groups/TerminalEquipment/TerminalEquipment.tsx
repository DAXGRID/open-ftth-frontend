import { useState, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faPen } from "@fortawesome/free-solid-svg-icons";
import { useTranslation, TFunction } from "react-i18next";

type TerminalEquipmentTableContainerProps = {
  children: ReactNode;
  headerTexts?: string[];
  editMode: boolean;
  toggleEditMode: () => void;
};

function TerminalEquipmentTableContainer({
  children,
  headerTexts,
  editMode,
  toggleEditMode,
}: TerminalEquipmentTableContainerProps) {
  return (
    <div className="terminal-equipment-table-container">
      <div className="terminal-equipment-table-container-header">
        {headerTexts?.map((x) => {
          return <p key={x}>{x}</p>;
        })}
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
  translation: TFunction;
};

function TerminalEquipmentTable({
  editMode,
  translation,
}: TerminalEquipmentTableProps) {
  return (
    <div className="terminal-equipment-table">
      <div
        className="terminal-equipment-header
        terminal-equipment-table-row
        terminal-equipment-table-grid-header"
      >
        <div className="terminal-equipment-table-item">
          {translation("A-INFO")}
        </div>
        <div className="terminal-equipment-table-item">
          {translation("FROM")}
        </div>
        <div className="terminal-equipment-table-item">
          {translation("PIN/PORT")}
        </div>
        <div className="terminal-equipment-table-item">{translation("TO")}</div>
        <div className="terminal-equipment-table-item">
          {translation("Z-INFO")}
        </div>
      </div>
      <div className="terminal-equipment-table-body">
        <div className="terminal-equipment-table-row">
          <div className="terminal-equipment-header-row">
            <p className="terminal-equipment-row-header__item">1</p>
            <p className="terminal-equipment-row-header__item">
              12 soems bred splidsebakke
            </p>
            <p className="terminal-equipment-row-header__item">
              (2 af 12 pladser brugt)
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
              Total 29 installations. 3 free ports
            </div>
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
            <div className="terminal-equipment-table-item">2 -O-</div>
            <div className="terminal-equipment-table-item">
              Splitter 1 (1:32) Ind 1
            </div>
            <div className="terminal-equipment-table-item">
              Total 29 installations. 3 free ports
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
                  {translation("FREE")}
                </div>
                <div className="terminal-equipment-table-item">3</div>
                <div
                  className="terminal-equipment-table-item
                  terminal-equipment-table-item--free"
                >
                  {translation("FREE")}
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

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div>
      <TerminalEquipmentTableContainer
        headerTexts={["Rack position: 3", "Type: Comspec FIST-GSS2"]}
        editMode={editMode}
        toggleEditMode={toggleEditMode}
      >
        <TerminalEquipmentTable editMode={editMode} translation={t} />
      </TerminalEquipmentTableContainer>
    </div>
  );
}

export default TerminalEquipment;
