import { useMemo, useState } from "react";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import LabelContainer from "../../components/LabelContainer";
import DefaultButton from "../../components/DefaultButton";
import TextBox from "../../components/TextBox";
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

function createRows(
  from: ConnectivityFaceConnection[],
  to: ConnectivityFaceConnection[]
): EquipmentSelectorRow[] {
  {
    return from.map<EquipmentSelectorRow>((x, i) => {
      return {
        from: {
          id: x.id,
          endInfo: x.endInfo,
          isConnected: x.isConnected,
          name: x.name,
        },
        to: {
          id: to[i].id,
          endInfo: to[i].endInfo,
          isConnected: to[i].isConnected,
          name: to[i].name,
        },
      };
    });
  }
}

function createNumberOptions(count: number): SelectOption[] {
  if (count === 0) return [{ text: "0", value: 0, key: 0 }];
  return Array.from({ length: count }, (_, k) => k + 1).map<SelectOption>(
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
      text: `${y.name} (${y.endInfo})`,
      value: y.id,
      disabled: y.isConnected,
      key: y.id,
    };
  });
}

function getAvailableConnections(
  from: ConnectivityFaceConnection[],
  to: ConnectivityFaceConnection[],
  fromId: string,
  toId: string,
  count: number
): { from: ConnectivityFaceConnection[]; to: ConnectivityFaceConnection[] } {
  const fromFiltered = from.filter((x) => !x.isConnected);
  const toFiltered = to.filter((x) => !x.isConnected);

  const fromIndex = fromFiltered.findIndex((x) => x.id === fromId);
  const toIndex = toFiltered.findIndex((x) => x.id === toId);

  const fromAvailable = fromFiltered.splice(fromIndex, count);
  const toAvailable = toFiltered.splice(toIndex, count);

  return { from: fromAvailable, to: toAvailable };
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

function FiberConnectionEditor() {
  const { t } = useTranslation();
  const [fromEquipmentId, setFromEquipmentId] = useState<string>("");
  const [toEquipmentId, setToEquipmentId] = useState<string>("");
  const [fromPositionId, setFromPositionId] = useState<string>("");
  const [toPositionId, setToPositionId] = useState<string>("");
  const [numberOfConnections, setNumberOfConnections] = useState(0);
  const [jumps, setJumps] = useState(0);
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

  const maxAvailableConnectionsCount = useMemo(() => {
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
    tConnectivityFaceConnections,
    sConnectivityFaceConnections,
    fromPositionId,
    toPositionId,
  ]);

  const rows = useMemo(() => {
    if (
      !tConnectivityFaceConnections.connectivityFaceConnections ||
      !sConnectivityFaceConnections.connectivityFaceConnections ||
      !fromPositionId ||
      !toPositionId ||
      !numberOfConnections
    )
      return [];

    const available = getAvailableConnections(
      tConnectivityFaceConnections.connectivityFaceConnections,
      sConnectivityFaceConnections.connectivityFaceConnections,
      fromPositionId,
      toPositionId,
      numberOfConnections
    );

    return createRows(available.from, available.to);
  }, [
    tConnectivityFaceConnections,
    sConnectivityFaceConnections,
    fromPositionId,
    toPositionId,
    numberOfConnections,
    jumps,
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
            options={createNumberOptions(maxAvailableConnectionsCount)}
            removePlaceHolderOnSelect
            onSelected={(x) => setNumberOfConnections(Number(x))}
            selected={numberOfConnections}
          />
        </LabelContainer>
        <LabelContainer text={t("FROM_EQUIPMENT_JUMP")}>
          <SelectMenu
            options={createNumberOptions(maxAvailableConnectionsCount)}
            removePlaceHolderOnSelect
            onSelected={(x) => setJumps(Number(x))}
            selected={jumps}
          />
        </LabelContainer>
        <LabelContainer text={t("PATCH/PIGTAIL_COORD_LENGTH_CM")}>
          <TextBox minWidth="250px" setValue={() => {}} value="0" />
        </LabelContainer>
      </div>
      <div className="full-row">
        <EquipmentSelector t={t} rows={rows} />
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
