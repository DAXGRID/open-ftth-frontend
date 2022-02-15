import { useState, useEffect } from "react";
import Checkbox from "../../../components/Checkbox";
import { TerminalEquipment } from "../TerminalEquipmentGql";

interface CheckboxListChange {
  value: string | number;
  checked: boolean;
}

interface CheckboxPair {
  checked: boolean;
  text: string;
  value: string | number;
}

interface DisconnectFiberRowProps {
  checkboxPair: CheckboxPair;
  onCheckboxListChange: (change: CheckboxListChange) => void;
}

function DisconnectFiberRow({
  checkboxPair,
  onCheckboxListChange,
}: DisconnectFiberRowProps) {
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

  useEffect(() => {
    console.log(pairs);
  }, [pairs]);

  return (
    <div className="disconnect-fiber-editor">
      <div className="disconnect-fiber-editor-container">
        <div className="disconnect-fiber-editor-container-header"></div>
        <div className="disconnect-fiber-editor-container-body">
          {pairs.map((x) => {
            return (
              <DisconnectFiberRow
                key={x.value}
                checkboxPair={x}
                onCheckboxListChange={onCheckboxListChange}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DisconnectFiberEditor;
