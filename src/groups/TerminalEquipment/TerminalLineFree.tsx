import { useTranslation } from "react-i18next";
import { Line } from "./TerminalEquipmentGql";
import PinPort from "./PinPort";

type TerminalLineFreeProps = {
  line: Line;
  terminalEquipmentOrRackId: string;
};

function TerminalLineFree({
  line,
  terminalEquipmentOrRackId,
}: TerminalLineFreeProps) {
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
          <PinPort
            terminalEquipmentOrRackId={terminalEquipmentOrRackId}
            line={line}
          />
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

export default TerminalLineFree;
