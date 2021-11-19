import { useMemo, useState } from "react";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import LabelContainer from "../../components/LabelContainer";
import DefaultButton from "../../components/DefaultButton";
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

function getEquipmentKind(
  id: string,
  connectivityFaces: ConnectivityFace[]
): string {
  if (!id) return "";
  return (
    connectivityFaces.find((x) => x.equipmentId === id)?.equipmentKind ?? ""
  );
}

function bothTerminalEquipment(
  fromId: string,
  toId: string,
  connectivityFaces: ConnectivityFace[]
): boolean {
  if (!fromId || !toId) return false;
  const fromKind = getEquipmentKind(fromId, connectivityFaces);
  const toKind = getEquipmentKind(toId, connectivityFaces);
  if (!fromKind || !toKind) return false;
  return fromKind === "TerminalEquipment" && toKind === "TerminalEquipment";
}

function createRows(
  from: ConnectivityFaceConnection[],
  to: ConnectivityFaceConnection[]
): EquipmentSelectorRow[] {
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
      value: y.equipmentId,
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
  count: number,
  jumps: number
): { from: ConnectivityFaceConnection[]; to: ConnectivityFaceConnection[] } {
  const fromFiltered = from.filter((x) => !x.isConnected);
  const toFiltered = to.filter((x) => !x.isConnected);

  const fromIndex = fromFiltered.findIndex((x) => x.id === fromId);
  const toIndex = toFiltered.findIndex((x) => x.id === toId);

  let fromAvailable: ConnectivityFaceConnection[] = [];
  const toAvailable = toFiltered.splice(toIndex, count);
  if (jumps <= 1) {
    fromAvailable = fromFiltered.splice(fromIndex, count);
  } else {
    let fromRest = fromFiltered.splice(fromIndex);
    let fromFirst = fromRest.splice(0, count / 2);
    let fromSecond = fromRest.splice(jumps, count / 2);
    fromAvailable = fromFirst
      .map((element, index) => [element, fromSecond[index]])
      .flat();
  }

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

function findAvailableJumps(
  maxAvailableConnections: number,
  numberOfConnections: number
) {
  if (!maxAvailableConnections || !numberOfConnections) return 1;
  if (numberOfConnections === 1) return 1;
  if (numberOfConnections === maxAvailableConnections) return 1;
  return maxAvailableConnections - numberOfConnections;
}

function FiberConnectionEditor() {
  const { t } = useTranslation();
  const [fromEquipmentId, setFromEquipmentId] = useState<string>("");
  const [toEquipmentId, setToEquipmentId] = useState<string>("");
  const [fromPositionId, setFromPositionId] = useState<string>("");
  const [toPositionId, setToPositionId] = useState<string>("");
  const [numberOfConnections, setNumberOfConnections] = useState(1);
  const [jumps, setJumps] = useState(1);
  const [coord, setCoord] = useState(0);
  const [connectivityData] = useState(getConnectivityFacesData());
  const [fromConnectivityFaceConnections] = useState(
    getTConnectivityFaceConnectionsData()
  );
  const [toConnectivityFaceConnections] = useState(
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

  const fromConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceConnectionSelectOptions(
        fromConnectivityFaceConnections.connectivityFaceConnections
      ),
    ];
  }, [fromConnectivityFaceConnections, t]);

  const toConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceConnectionSelectOptions(
        toConnectivityFaceConnections.connectivityFaceConnections
      ),
    ];
  }, [toConnectivityFaceConnections, t]);

  const maxAvailableConnectionsCount = useMemo(() => {
    if (
      !fromConnectivityFaceConnections.connectivityFaceConnections ||
      !toConnectivityFaceConnections.connectivityFaceConnections ||
      !fromPositionId ||
      !toPositionId
    )
      return 0;

    return findAvailableCountFaceConnections(
      fromConnectivityFaceConnections.connectivityFaceConnections,
      toConnectivityFaceConnections.connectivityFaceConnections,
      fromPositionId,
      toPositionId
    );
  }, [
    fromConnectivityFaceConnections,
    toConnectivityFaceConnections,
    fromPositionId,
    toPositionId,
  ]);

  const maxAvailableJumps = useMemo(() => {
    return findAvailableJumps(
      maxAvailableConnectionsCount,
      numberOfConnections
    );
  }, [maxAvailableConnectionsCount, numberOfConnections]);

  const connectionRows = useMemo(() => {
    if (
      !fromConnectivityFaceConnections.connectivityFaceConnections ||
      !toConnectivityFaceConnections.connectivityFaceConnections ||
      !fromPositionId ||
      !toPositionId ||
      !numberOfConnections ||
      !jumps
    )
      return [];

    const available = getAvailableConnections(
      fromConnectivityFaceConnections.connectivityFaceConnections,
      toConnectivityFaceConnections.connectivityFaceConnections,
      fromPositionId,
      toPositionId,
      numberOfConnections,
      jumps
    );

    return createRows(available.from, available.to);
  }, [
    fromConnectivityFaceConnections,
    toConnectivityFaceConnections,
    fromPositionId,
    toPositionId,
    numberOfConnections,
    jumps,
  ]);

  const handleSetFromEquipmentId = (x: string) => {
    setFromEquipmentId(x);
    setFromPositionId("");
  };

  const handleSetToEquipmentId = (x: string) => {
    setToEquipmentId(x);
    setToPositionId("");
  };

  const handleSetFromPositionId = (x: string) => {
    setFromPositionId(x);
    setNumberOfConnections(1);
    setJumps(1);
  };

  const handleSetToPositionId = (x: string) => {
    setToPositionId(x);
    setNumberOfConnections(1);
    setJumps(1);
  };

  const handleSetNumberOfConnections = (x: number) => {
    setNumberOfConnections(x);
    setJumps(1);
  };

  return (
    <div className="fiber-connection-editor">
      <div className="full-row">
        <LabelContainer text={t("FROM_EQUIPMENT")}>
          <SelectMenu
            options={connectivityFaceOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => handleSetFromEquipmentId(x as string)}
            selected={fromEquipmentId}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_EQUIPMENT")}>
          <SelectMenu
            options={connectivityFaceOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => handleSetToEquipmentId(x as string)}
            selected={toEquipmentId}
            enableSearch={true}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text={t("FROM_POSITION")}>
          <SelectMenu
            options={fromConnectivityFaceConnectionOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => handleSetFromPositionId(x as string)}
            selected={fromPositionId}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_POSITION")}>
          <SelectMenu
            options={toConnectivityFaceConnectionOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => handleSetToPositionId(x as string)}
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
            onSelected={(x) => handleSetNumberOfConnections(Number(x))}
            selected={numberOfConnections}
          />
        </LabelContainer>
        <LabelContainer text={t("FROM_EQUIPMENT_JUMP")}>
          <SelectMenu
            options={createNumberOptions(maxAvailableJumps)}
            removePlaceHolderOnSelect
            onSelected={(x) => setJumps(Number(x))}
            selected={jumps}
          />
        </LabelContainer>
        {bothTerminalEquipment(
          fromEquipmentId,
          toEquipmentId,
          connectivityData.equipmentConnectivityFaces
        ) && (
          <LabelContainer text={t("PATCH/PIGTAIL_COORD_LENGTH_CM")}>
            <NumberPicker
              minWidth="250px"
              setValue={(x) => setCoord(x)}
              value={coord}
            />
          </LabelContainer>
        )}
      </div>
      <div className="full-row">
        <EquipmentSelector t={t} rows={connectionRows} />
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
