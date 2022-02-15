import { useState, useMemo } from "react";
import Checkbox from "../../../components/Checkbox";
import { TerminalEquipment, Line } from "../TerminalEquipmentGql";

interface CheckboxListChange {
  value: string | number;
  checked: boolean;
}

interface CheckboxPair {
  checked: boolean;
  text: string;
  value: string | number;
}

interface DisconnectFiberLineProps {
  checkboxPair: CheckboxPair;
  onCheckboxListChange: (change: CheckboxListChange) => void;
}

function DisconnectFiberLine({
  checkboxPair,
  onCheckboxListChange,
}: DisconnectFiberLineProps) {
  return (
    <div className="disconnect-fiber-row">
      <Checkbox
        checked={checkboxPair.checked}
        onChange={onCheckboxListChange}
        value={checkboxPair.value}
      />
      <span>{checkboxPair.text}</span>
    </div>
  );
}

interface DisconnectFiberHeader {
  text: string;
}
function DisconnectFiberHeader({ text }: DisconnectFiberHeader) {
  return <div>{text}</div>;
}

interface DisconnectFiberEditorProps {
  side: "A" | "Z";
  terminalEquipment: TerminalEquipment;
}

function DisconnectFiberEditor({
  side,
  terminalEquipment,
}: DisconnectFiberEditorProps) {
  const [pairs, setPairs] = useState<CheckboxPair[]>([
    { text: "Rune", value: "1", checked: false },
    { text: "Jesper", value: "2", checked: false },
    { text: "Simon", value: "3", checked: false },
    { text: "Mathias", value: "4", checked: false },
  ]);

  const onCheckboxListChange = ({ value, checked }: CheckboxListChange) => {
    setPairs(
      pairs.map((pair) =>
        pair.value === value ? { ...pair, checked: checked } : pair
      )
    );
  };

  return (
    <div className="disconnect-fiber-editor">
      <div className="disconnect-fiber-editor-container">
        <div className="disconnect-fiber-editor-container-header"></div>
        <div className="disconnect-fiber-editor-container-body">
          {terminalEquipment.terminalStructures.map((structure, i) => {
            return (
              <div key={i}>
                <DisconnectFiberHeader text={structure.name} key={i} />
                {structure.lines.map((line) => {
                  return <></>;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DisconnectFiberEditor;
