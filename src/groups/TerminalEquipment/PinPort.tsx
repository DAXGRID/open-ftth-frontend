import { useContext } from "react";
import { TerminalEquipmentContext } from "./TerminalEquipmentContext";
import { Line } from "./TerminalEquipmentGql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug } from "@fortawesome/free-solid-svg-icons";

type PinPortProps = {
  line: Line;
};

function PinPort({ line }: PinPortProps) {
  const { dispatch } = useContext(TerminalEquipmentContext);

  return (
    <div className="table-item-terminal">
      <div
        role="button"
        onClick={() => dispatch({ type: "setShowFiberEditor", show: true })}
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
        onClick={() => dispatch({ type: "setShowFiberEditor", show: true })}
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

export default PinPort;
