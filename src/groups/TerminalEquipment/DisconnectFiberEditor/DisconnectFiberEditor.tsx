import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import Checkbox from "../../../components/Checkbox";
import {
  DisconnectSpanEquipmentFromTerminalView,
  disconnectSpanEquipmentFromTerminalViewQuery,
  Line,
} from "./DisconnectFiberEditorGql";

interface CheckboxPair {
  checked: boolean;
  value: string | number;
  line: Line;
}

interface CheckboxListChangeEvent {
  checked: boolean;
  value: string | number;
}

interface DisconnectFiberLineProps {
  checkboxPair: CheckboxPair;
  onCheckboxListChange: (change: CheckboxListChangeEvent) => void;
}

interface DisconnectFiberEditorProps {
  terminalId: string;
  spanSegmentId: string;
}

function createLineCheckboxPairs(
  lines: Line[],
  spanSegmentId: string
): CheckboxPair[] {
  return lines
    .filter((line) => line.isConnected)
    .map((line) => ({
      checked: line.segmentId === spanSegmentId,
      value: line.segmentId,
      line: line,
    }));
}

function DisconnectFiberEditor({
  terminalId,
  spanSegmentId,
}: DisconnectFiberEditorProps) {
  const client = useClient();
  const { t } = useTranslation();
  const [view, setView] = useState<DisconnectSpanEquipmentFromTerminalView>();
  const [pairs, setPairs] = useState<CheckboxPair[]>([]);

  useEffect(() => {
    disconnectSpanEquipmentFromTerminalViewQuery(client, {
      spanSegmentId,
      terminalId,
    }).then((response) => {
      if (response.data) {
        setView(
          response.data.utilityNetwork.disconnectSpanEquipmentFromTerminalView
        );
      }
    });
  }, [terminalId, spanSegmentId, client]);

  useEffect(() => {
    if (!view) return;
    setPairs(createLineCheckboxPairs(view.lines, spanSegmentId));
  }, [view, spanSegmentId]);

  const onCheckboxListChange = ({
    value,
    checked,
  }: CheckboxListChangeEvent) => {
    setPairs(
      pairs.map((pair) =>
        pair.value === value ? { ...pair, checked: checked } : pair
      )
    );
  };

  if (!view) return <></>;

  return (
    <div className="disconnect-fiber-editor">
      <div className="disconnect-fiber-editor-container">
        <div className="disconnect-fiber-editor-container-header">
          <div className="disconnect-fiber-editor-container-header-item"></div>
          <div className="disconnect-fiber-editor-container-header-item">
            {t("EQUIPMENT")}
          </div>
          <div className="disconnect-fiber-editor-container-header-item">
            {t("BAKKE/KORT")}
          </div>
          <div className="disconnect-fiber-editor-container-header-item">
            {t("PIN/PORT")}
          </div>
          <div className="disconnect-fiber-editor-container-header-item">
            {/* Needs to be empty for symbol */}
          </div>
          <div className="disconnect-fiber-editor-container-header-item">
            {t("FIBER_NUMBER")}
          </div>
          <div className="disconnect-fiber-editor-container-header-item">
            {t("TUBE/FIBER")}
          </div>
          <div className="disconnect-fiber-editor-container-header-item">
            {t("KREDSLOEBENE")}
          </div>
        </div>
        <div className="disconnect-fiber-editor-container-body">
          {pairs.map((x) => {
            return (
              <div
                className="disconnect-fiber-editor-container-body-line"
                key={x.value}
              >
                <div className="disconnect-fiber-editor-container-body-line-item">
                  <Checkbox
                    checked={x.checked}
                    onChange={onCheckboxListChange}
                    value={x.value}
                  />
                </div>
                <div className="disconnect-fiber-editor-container-body-line-item">
                  {x.line.terminalEquipmentName}
                </div>
                <div className="disconnect-fiber-editor-container-body-line-item">
                  {x.line.terminalStructureName}
                </div>
                <div className="disconnect-fiber-editor-container-body-line-item">
                  {x.line.terminalName}
                </div>
                <div className="disconnect-fiber-editor-container-body-line-item text-center">
                  {"<-O->"}
                </div>
                <div className="disconnect-fiber-editor-container-body-line-item">
                  {x.line.spanStructureName}
                </div>
                <div className="disconnect-fiber-editor-container-body-line-item">
                  {x.line.end}
                </div>
                <div className="disconnect-fiber-editor-container-body-line-item">
                  {x.line.terminalEquipmentName}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DisconnectFiberEditor;
