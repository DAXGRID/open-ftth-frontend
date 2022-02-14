import { useState, useContext } from "react";
import Checkbox from "../../../components/Checkbox";

interface CheckboxPair {
  checked: boolean;
  text: string;
  value: string | number;
}

interface CheckboxListChange {
  value: string | number;
  checked: boolean;
}

interface DisconnectFiberEditor {}

function DisconnectFiberEditor({}: DisconnectFiberEditor) {
  const [pairs, setPairs] = useState([
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
        <div className="disconnect-fiber-editor-container-header">
          <p>Hello headers!</p>
        </div>
        <div className="disconnect-fiber-editor-container-body">
          {pairs.map((x) => {
            return (
              <div className="disconnect-line" key={x.value}>
                <Checkbox
                  checked={x.checked}
                  onChange={onCheckboxListChange}
                  value={x.value}
                />
                <span>{x.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DisconnectFiberEditor;
