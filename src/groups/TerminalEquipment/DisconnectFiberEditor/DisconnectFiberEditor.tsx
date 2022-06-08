import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import Checkbox from "../../../components/Checkbox";
import {
  DisconnectSpanEquipmentFromTerminalView,
  disconnectSpanEquipmentFromTerminalViewQuery,
  Line,
  disconnectFromTerminalEquipment,
} from "./DisconnectFiberEditorGql";
import DefaultButton from "../../../components/DefaultButton";
import { toast } from "react-toastify";

interface CheckboxPair {
  checked: boolean;
  value: string | number;
  line: Line;
}

interface CheckboxListChangeEvent {
  checked: boolean;
  value: string | number;
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

function canDisconnect(pairs: CheckboxPair[]): boolean {
  return !!pairs.find((x) => x.checked);
}

interface DisconnectFiberEditorProps {
  terminalId: string;
  spanSegmentId: string;
  routeNodeId: string;
  disconnectCallback?: () => void;
}

function DisconnectFiberEditor({
  terminalId,
  spanSegmentId,
  routeNodeId,
  disconnectCallback,
}: DisconnectFiberEditorProps) {
  const client = useClient();
  const { t } = useTranslation();
  const [view, setView] = useState<DisconnectSpanEquipmentFromTerminalView>();
  const [pairs, setPairs] = useState<CheckboxPair[]>([]);
  const [toggleAll, setToggleAll] = useState<boolean>(false);

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

  const onToggleAllChange = ({ checked }: CheckboxListChangeEvent) => {
    setToggleAll(checked);
    if (checked) {
      setPairs(pairs.map((x) => ({ ...x, checked: true })));
    } else {
      setPairs(pairs.map((x) => ({ ...x, checked: false })));
    }
  };

  const disconnect = async () => {
    const disconnects = pairs
      .filter((x) => x.checked)
      .map((x) => ({
        terminalId: x.line.terminalId,
        spanSegmentId: x.line.segmentId,
      }));

    const response = await disconnectFromTerminalEquipment(client, {
      disconnects: disconnects,
      routeNodeId: routeNodeId,
    });

    if (
      response.data?.spanEquipment.disconnectFromTerminalEquipment.isSuccess
    ) {
      toast.success(t("DISCONNECTED"));
      if (disconnectCallback) {
        disconnectCallback();
      }
    } else {
      toast.error(
        response.data?.spanEquipment.disconnectFromTerminalEquipment
          .errorCode ?? "ERROR"
      );
    }
  };

  if (!view) return <></>;

  return (
    <div className="disconnect-fiber-editor">
      <div className="full-row">
        <p className="disconnect-fiber-editor__title">
          {t("NAME")}: {view.spanEquipmentName}
        </p>
      </div>
      <div className="full-row">
        <div className="disconnect-fiber-editor-container">
          <div className="disconnect-fiber-editor-container-header">
            <div className="disconnect-fiber-editor-container-header-item">
              <Checkbox
                value={"-1"}
                checked={toggleAll}
                onChange={onToggleAllChange}
              />
            </div>
            <div className="disconnect-fiber-editor-container-header-item">
              {t("EQUIPMENT")}
            </div>
            <div className="disconnect-fiber-editor-container-header-item">
              {t("TRAY/CARD")}
            </div>
            <div className="disconnect-fiber-editor-container-header-item">
              {t("PIN/PORT")}
            </div>
            <div className="disconnect-fiber-editor-container-header-item">
              {t("CONNECTION")}
            </div>
            <div className="disconnect-fiber-editor-container-header-item">
              {t("CURCUIT_END")}
            </div>
          </div>
          <div className="disconnect-fiber-editor-container-body">
            <div className="disconnect-fiber-editor-container-body-line"></div>
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
                  <div className="disconnect-fiber-editor-container-body-line-item">
                    {x.line.spanStructureName}
                  </div>
                  <div className="disconnect-fiber-editor-container-body-line-item">
                    {x.line.end}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="full-row center-items">
        <DefaultButton
          disabled={!canDisconnect(pairs)}
          innerText={t("DISCONNECT")}
          maxWidth="500px"
          onClick={async () => await disconnect()}
        />
      </div>
    </div>
  );
}

export default DisconnectFiberEditor;
