import { useContext } from "react";
import { TerminalEquipmentContext } from "./TerminalEquipmentContext";
import { Line } from "./TerminalEquipmentGql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug } from "@fortawesome/free-solid-svg-icons";

type PinPortProps = {
  line: Line;
  terminalEquipmentOrRackId: string;
};

function PinPort({ line, terminalEquipmentOrRackId }: PinPortProps) {
  const { state, dispatch } = useContext(TerminalEquipmentContext);

  const handleA = () => {
    if (!state.editable) return;
    if (!line.a?.connectedTo) {
      dispatch({
        type: "setShowFiberEditor",
        show: {
          faceKind: line.a?.faceKind ?? null,
          terminalId: line.a?.terminal.id ?? null,
          show: true,
          side: "A",
          terminalEquipmentOrRackId: terminalEquipmentOrRackId,
        },
      });
    } else {
      if (line.a?.faceKind && terminalEquipmentOrRackId) {
        dispatch({
          type: "setShowDisconnectFiberEditor",
          show: {
            show: true,
            side: "A",
            terminalEquipmentOrRackId: terminalEquipmentOrRackId,
            terminalId: line.a.terminal.id,
          },
        });
      } else {
        throw Error(
          "line.a.faceKind or terminalEquipmentOrRackId was not set."
        );
      }
    }
  };

  const handleZ = () => {
    if (!state.editable) return;
    if (!line.z?.connectedTo) {
      if (line.z?.faceKind && line.z.terminal.id && terminalEquipmentOrRackId) {
        dispatch({
          type: "setShowFiberEditor",
          show: {
            faceKind: line.z.faceKind,
            terminalId: line.z.terminal.id,
            show: true,
            side: "Z",
            terminalEquipmentOrRackId: terminalEquipmentOrRackId,
          },
        });
      } else {
        throw Error(
          "TerminalEquipmentOrRackId or line.z.faceKind was not set."
        );
      }
    } else {
      if (terminalEquipmentOrRackId && line.z.faceKind) {
        dispatch({
          type: "setShowDisconnectFiberEditor",
          show: {
            show: true,
            side: "Z",
            terminalEquipmentOrRackId: terminalEquipmentOrRackId,
            terminalId: line.z.terminal.id,
          },
        });
      } else {
        throw Error(
          "TerminalEquipmentOrRackId or line.z.faceKind was not set."
        );
      }
    }
  };

  return (
    <div className="table-item-terminal">
      <div
        role="button"
        onClick={() => handleA()}
        className={`table-item-terminal__item ${
          line.a?.connectedTo ? "text-red" : "text-green"
        }`}
      >
        {line.a && (
          <FontAwesomeIcon
            className={`${state.editable ? "" : "not-allowed-hover"}`}
            icon={faPlug}
          />
        )}
      </div>
      <div className="table-item-terminal__item">
        {line.a?.terminal.name ?? ""}
      </div>
      <div className="table-item-terminal__item">-O-</div>
      <div className="table-item-terminal__item">
        {line.z?.terminal.name ?? ""}
      </div>
      <div
        role="button"
        onClick={() => handleZ()}
        className={`table-item-terminal__item ${
          line.z?.connectedTo ? "text-red" : "text-green"
        }`}
      >
        {line.z && (
          <FontAwesomeIcon
            className={`${state.editable ? "" : "not-allowed-hover"}`}
            icon={faPlug}
          />
        )}
      </div>
    </div>
  );
}

export default PinPort;
