import { useContext } from "react";
import { TerminalEquipmentContext } from "./TerminalEquipmentContext";
import { Line } from "./TerminalEquipmentGql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PinPort from "./PinPort";
import TerminalEquipmentTraceView from "./TerminalEquipmentTraceView";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import colorCodedElement from "./ColorCodedElement";

interface TerminalLineProps {
  line: Line;
  terminalEquipmentOrRackId: string;
}

function TerminalLine({ line, terminalEquipmentOrRackId }: TerminalLineProps) {
  const { state, dispatch } = useContext(TerminalEquipmentContext);
  const { t } = useTranslation();

  return (
    <>
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
              <FontAwesomeIcon
                icon={
                  (state.connectivityTraceViews[
                    line.a?.terminal.id ?? line.z?.terminal.id ?? ""
                  ]?.show ?? false)
                    ? faChevronDown
                    : faChevronRight
                }
              />
            </span>
            <span className="terminal-equipment-table-item__equipped">
              {line.a?.end}
            </span>
          </div>
          <div className="terminal-equipment-table-item">
            {colorCodedElement(line.a?.connectedTo ?? "", t)}
          </div>
          <div className="terminal-equipment-table-item">
            <PinPort
              terminalEquipmentOrRackId={terminalEquipmentOrRackId}
              line={line}
            />
          </div>
          <div className="terminal-equipment-table-item">
            {colorCodedElement(line.z?.connectedTo ?? "", t)}
          </div>
          <div className="terminal-equipment-table-item">
            {line.z?.end ?? ""}
          </div>
        </div>
      </div>

      <TerminalEquipmentTraceView
        view={
          state.connectivityTraceViews[
            line.a?.terminal.id ?? line.z?.terminal.id ?? ""
          ]
        }
      />
    </>
  );
}

export default TerminalLine;
