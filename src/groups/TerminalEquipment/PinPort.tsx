import { useContext } from "react";
import { TerminalEquipmentContext } from "./TerminalEquipmentContext";
import { Line } from "./TerminalEquipmentGql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug } from "@fortawesome/free-solid-svg-icons";

type PinPortProps = {
  line: Line;
};

function PinPort({ line }: PinPortProps) {
  const { state, dispatch } = useContext(TerminalEquipmentContext);

  return (
    <div className="table-item-terminal">
      <div
        role="button"
        onClick={() =>
          state.editable &&
          !line.a?.connectedTo &&
          dispatch({
            type: "setShowFiberEditor",
            show: {
              faceKind: line.a?.faceKind ?? null,
              terminalId: line.a?.terminal.id ?? null,
              show: true,
              side: "A",
            },
          })
        }
        className={`table-item-terminal__item ${
          line.a?.connectedTo ? "text-red" : "text-green"
        }`}
      >
        {line.a && (
          <FontAwesomeIcon
            className={`${
              state.editable && !line.a?.connectedTo ? "" : "not-allowed-hover"
            }`}
            icon={faPlug}
          />
        )}
      </div>
      <div className="table-item-terminal__item">{line.a?.terminal.name}</div>
      <div className="table-item-terminal__item">-O-</div>
      <div className="table-item-terminal__item">{line.z?.terminal.name}</div>
      <div
        role="button"
        onClick={() =>
          state.editable &&
          !line.z?.connectedTo &&
          dispatch({
            type: "setShowFiberEditor",
            show: {
              faceKind: line.z?.faceKind ?? null,
              terminalId: line.z?.terminal.id ?? null,
              show: true,
              side: "Z",
            },
          })
        }
        className={`table-item-terminal__item ${
          line.z?.connectedTo ? "text-red" : "text-green"
        }`}
      >
        {line.z && (
          <FontAwesomeIcon
            className={`${
              state.editable && !line.z?.connectedTo ? "" : "not-allowed-hover"
            }`}
            icon={faPlug}
          />
        )}
      </div>
    </div>
  );
}

export default PinPort;
