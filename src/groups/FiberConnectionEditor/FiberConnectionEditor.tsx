import { useMemo, useState } from "react";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import LabelContainer from "../../components/LabelContainer";
import DefaultButton from "../../components/DefaultButton";
import TextBox from "../../components/TextBox";
import NumberPicker from "../../components/NumberPicker";
import EquipmentSelector from "./EquipmentSelector";
import { useTranslation } from "react-i18next";
import {
  getConnectivityFacesData,
  ConnectivityFace,
  ConnectivityFaceConnection,
  getTConnectivityFaceConnectionsData,
  getSConnectivityFaceConnectionsData,
} from "./FiberConnectionEditorGql";

type EquipmentSelectorRow = {
  rows: {
    from: {
      id: string;
      name: string;
      endInfo: string;
      isConnected: boolean;
    };
    to: {
      id: string;
      name: string;
      endInfo: string;
      isConnected: boolean;
    };
  };
};

function createNumberOptions(count: number): SelectOption[] {
  if (count === 0) return [{ text: "0", value: 0, key: 0 }];

  return Array.from({ length: count }, (v, k) => k + 1).map<SelectOption>(
    (x) => {
      return { text: x.toString(), value: x, key: x };
    }
  );
}

function createConnectivityFaceSelectOptions(
  x: ConnectivityFace[]
): SelectOption[] {
  return x.map<SelectOption>((y) => {
    return {
      text: `${y.equipmentName} (${y.directionName})`,
      value: `${y.equipmentId}(${y.directionType})`,
      key: `${y.equipmentId}(${y.directionType})`,
    };
  });
}

function createConnectivityFaceConnectionSelectOptions(
  x: ConnectivityFaceConnection[]
): SelectOption[] {
  return x.map<SelectOption>((y) => {
    return {
      text: y.name,
      value: y.id,
      disabled: y.isConnected,
      key: y.id,
    };
  });
}

function findAvailableCountFaceConnections(
  from: ConnectivityFaceConnection[],
  to: ConnectivityFaceConnection[],
  fromId: string,
  toId: string
): number {
  const fromFiltered = from.filter((x) => !x.isConnected);
  const toFiltered = to.filter((x) => !x.isConnected);

  const fromIndex = fromFiltered.findIndex((x) => x.id === fromId);
  const toIndex = toFiltered.findIndex((x) => x.id === toId);

  const fromAvailableCount = fromFiltered.splice(fromIndex).length;
  const toAvailableCount = toFiltered.splice(toIndex).length;

  return fromAvailableCount > toAvailableCount
    ? toAvailableCount
    : fromAvailableCount;
}

function interleaveFaceConnections(
  from: ConnectivityFaceConnection[],
  to: ConnectivityFaceConnection[],
  count: number,
  jump: number
): EquipmentSelectorRow[] {
  const fromFiltered = from.filter((x) => !x.isConnected);
  const toFiltered = to.filter((x) => !x.isConnected);

  return [];
}

function FiberConnectionEditor() {
  const { t } = useTranslation();
  const [fromEquipmentId, setFromEquipmentId] = useState<string>("");
  const [toEquipmentId, setToEquipmentId] = useState<string>("");
  const [fromPositionId, setFromPositionId] = useState<string>("");
  const [toPositionId, setToPositionId] = useState<string>("");
  const [connectivityData] = useState(getConnectivityFacesData());
  const [tConnectivityFaceConnections] = useState(
    getTConnectivityFaceConnectionsData()
  );
  const [sConnectivityFaceConnections] = useState(
    getSConnectivityFaceConnectionsData()
  );

  const connectivityFaceOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceSelectOptions(
        connectivityData.equipmentConnectivityFaces
      ),
    ];
  }, [connectivityData, t]);

  const tConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceConnectionSelectOptions(
        tConnectivityFaceConnections.connectivityFaceConnections
      ),
    ];
  }, [tConnectivityFaceConnections, t]);

  const sConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceConnectionSelectOptions(
        sConnectivityFaceConnections.connectivityFaceConnections
      ),
    ];
  }, [sConnectivityFaceConnections, t]);

  const maxAvailableCount = useMemo(() => {
    if (
      !tConnectivityFaceConnections.connectivityFaceConnections ||
      !sConnectivityFaceConnections.connectivityFaceConnections ||
      !fromPositionId ||
      !toPositionId
    )
      return 0;

    return findAvailableCountFaceConnections(
      tConnectivityFaceConnections.connectivityFaceConnections,
      sConnectivityFaceConnections.connectivityFaceConnections,
      fromPositionId,
      toPositionId
    );
  }, [
    tConnectivityFaceConnectionOptions,
    sConnectivityFaceConnectionOptions,
    fromPositionId,
    toPositionId,
  ]);

  return (
    <div className="fiber-connection-editor">
      <div className="full-row">
        <LabelContainer text={t("FROM_EQUIPMENT")}>
          <SelectMenu
            options={connectivityFaceOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setFromEquipmentId(x as string)}
            selected={fromEquipmentId}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_EQUIPMENT")}>
          <SelectMenu
            options={connectivityFaceOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setToEquipmentId(x as string)}
            selected={toEquipmentId}
            enableSearch={true}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text={t("FROM_POSITION")}>
          <SelectMenu
            options={tConnectivityFaceConnectionOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setFromPositionId(x as string)}
            selected={fromPositionId}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_POSITION")}>
          <SelectMenu
            options={sConnectivityFaceConnectionOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setToPositionId(x as string)}
            selected={toPositionId}
            enableSearch={true}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text={t("NUMBER_OF_CONNECTIONS")}>
          <SelectMenu
            options={createNumberOptions(maxAvailableCount)}
            removePlaceHolderOnSelect
            onSelected={(x) => {}}
            selected={1}
          />
        </LabelContainer>
        <LabelContainer text={t("FROM_EQUIPMENT_JUMP")}>
          <NumberPicker minWidth="250px" setValue={() => {}} value={0} />
        </LabelContainer>
        <LabelContainer text={t("PATCH/PIGTAIL_COORD_LENGTH_CM")}>
          <TextBox minWidth="250px" setValue={() => {}} value="0" />
        </LabelContainer>
      </div>
      <div className="full-row">
        <EquipmentSelector t={t} rows={[]} />
      </div>
      <div className="full-row center-items">
        <DefaultButton
          innerText={t("CONNECT")}
          maxWidth="500px"
          onClick={() => {
            console.log("Clicked");
          }}
        />
      </div>
    </div>
  );
}

export default FiberConnectionEditor;
