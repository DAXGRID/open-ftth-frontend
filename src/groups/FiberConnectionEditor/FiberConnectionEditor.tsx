import { useMemo, useState, useEffect } from "react";
import { useClient } from "urql";
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
  getConnectivityFaceConnections,
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
        id: x.terminalOrSegmentId,
        endInfo: x.endInfo,
        isConnected: x.isConnected,
        name: x.name,
      },
      to: {
        id: to[i].terminalOrSegmentId,
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
  connecitivyFaces: ConnectivityFace[]
): SelectOption[] {
  return connecitivyFaces.map<SelectOption>((x) => {
    const id = getCombinedEquipmentId(x);
    return {
      text: `${x.equipmentName} (${x.faceName})`,
      value: id,
      key: id,
    };
  });
}

function createConnectivityFaceConnectionSelectOptions(
  x: ConnectivityFaceConnection[]
): SelectOption[] {
  return x.map<SelectOption>((y) => {
    return {
      text: `${y.name} ${y.endInfo ? "(" + y.endInfo + ")" : ""}`,
      value: y.terminalOrSegmentId,
      disabled: y.isConnected,
      key: y.terminalOrSegmentId,
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

  const fromIndex = fromFiltered.findIndex(
    (x) => x.terminalOrSegmentId === fromId
  );
  const toIndex = toFiltered.findIndex((x) => x.terminalOrSegmentId === toId);

  let fromAvailable: ConnectivityFaceConnection[] = [];
  const toAvailable = toFiltered.splice(toIndex, count);
  if (jumps <= 1) {
    fromAvailable = fromFiltered.splice(fromIndex, count);
  } else {
    const fromRest = fromFiltered.splice(fromIndex);
    const jumpedConnections: ConnectivityFaceConnection[] = [];
    for (let i = 0; i < Math.floor(fromRest.length / 2); i++) {
      jumpedConnections.push(fromRest[i]);
      jumpedConnections.push(fromRest[i + jumps]);
    }
    fromAvailable = jumpedConnections.splice(0, count);
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

  const fromIndex = fromFiltered.findIndex(
    (x) => x.terminalOrSegmentId === fromId
  );
  const toIndex = toFiltered.findIndex((x) => x.terminalOrSegmentId === toId);

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

function getCombinedEquipmentId({ equipmentId, faceKind }: ConnectivityFace) {
  return `${equipmentId}_${faceKind}`;
}

function getRootEquipmentId(combinedEquipmentId: string) {
  const splitted = combinedEquipmentId.split("_");
  return splitted[splitted.length - 1];
}

interface FiberConnectionEditorProps {
  routeNodeId: string;
}

function FiberConnectionEditor({ routeNodeId }: FiberConnectionEditorProps) {
  const { t } = useTranslation();
  const client = useClient();
  const [fromEquipmentId, setFromEquipmentId] = useState<string>("");
  const [toEquipmentId, setToEquipmentId] = useState<string>("");
  const [fromPositionId, setFromPositionId] = useState<string>("");
  const [toPositionId, setToPositionId] = useState<string>("");
  const [numberOfConnections, setNumberOfConnections] = useState(1);
  const [jumps, setJumps] = useState(1);
  const [coord, setCoord] = useState(0);
  const [connectivityFaces, setConnectivityFaces] = useState<
    ConnectivityFace[]
  >([]);
  const [fromConnectivityFaceConnections, setFromConnectivityFaceConnections] =
    useState<ConnectivityFaceConnection[]>([]);
  const [toConnectivityFaceConnections, setToConnectivityFaceConnections] =
    useState<ConnectivityFaceConnection[]>([]);

  useEffect(() => {
    getConnectivityFacesData(client, routeNodeId).then((response) => {
      const connecitivyFaceConnections =
        response.data?.utilityNetwork.connectivityFaces;

      if (connecitivyFaceConnections) {
        setConnectivityFaces(connecitivyFaceConnections);
      } else {
        throw Error("Could not load connectivity faces data");
      }
    });
  }, [routeNodeId, setConnectivityFaces, client]);

  useEffect(() => {
    if (!fromEquipmentId) return;

    const connecitivyFace = connectivityFaces.find(
      (x) => getCombinedEquipmentId(x) === fromEquipmentId
    );

    if (!connecitivyFace) throw Error("Could not find connectivity face.");

    getConnectivityFaceConnections(client, {
      faceType: connecitivyFace.faceKind,
      routeNodeId: routeNodeId,
      spanOrTerminalEquipmentId: connecitivyFace.equipmentId,
    }).then((response) => {
      const faceConnections =
        response.data?.utilityNetwork.connectivityFaceConnections;
      if (faceConnections) {
        setFromConnectivityFaceConnections(faceConnections);
      } else {
        throw Error(
          `Could not load face connections on id '${fromEquipmentId}'`
        );
      }
    });
  }, [
    fromEquipmentId,
    client,
    connectivityFaces,
    routeNodeId,
    setFromConnectivityFaceConnections,
  ]);

  useEffect(() => {
    if (!toEquipmentId) return;

    const connecitivyFace = connectivityFaces.find(
      (x) => getCombinedEquipmentId(x) === toEquipmentId
    );

    if (!connecitivyFace) throw Error("Could not find connectivity face.");

    getConnectivityFaceConnections(client, {
      faceType: connecitivyFace.faceKind,
      routeNodeId: routeNodeId,
      spanOrTerminalEquipmentId: connecitivyFace.equipmentId,
    }).then((response) => {
      const faceConnections =
        response.data?.utilityNetwork.connectivityFaceConnections;
      if (faceConnections) {
        setToConnectivityFaceConnections(faceConnections);
      } else {
        throw Error(
          `Could not load face connections on id '${fromEquipmentId}'`
        );
      }
    });
  }, [
    toEquipmentId,
    client,
    connectivityFaces,
    routeNodeId,
    setToConnectivityFaceConnections,
  ]);

  const fromConnectivityFaceOptions = useMemo<SelectOption[]>(() => {
    const defaultOption = { text: t("CHOOSE"), value: "", key: "0" };
    if (toEquipmentId) {
      const kind = getEquipmentKind(toEquipmentId, connectivityFaces);
      if (kind === "SpanEquipment") {
        return [
          defaultOption,
          ...createConnectivityFaceSelectOptions(
            connectivityFaces.filter(
              (x) => x.equipmentKind === "TerminalEquipment"
            )
          ),
        ];
      }
    }

    return [
      defaultOption,
      ...createConnectivityFaceSelectOptions(connectivityFaces),
    ];
  }, [connectivityFaces, t, toEquipmentId]);

  const toConnectivityFaceOptions = useMemo<SelectOption[]>(() => {
    const defaultOption = { text: t("CHOOSE"), value: "", key: "0" };
    if (fromEquipmentId) {
      const kind = getEquipmentKind(fromEquipmentId, connectivityFaces);
      if (kind === "SpanEquipment") {
        return [
          defaultOption,
          ...createConnectivityFaceSelectOptions(
            connectivityFaces.filter(
              (x) => x.equipmentKind === "TerminalEquipment"
            )
          ),
        ];
      }
    }

    return [
      defaultOption,
      ...createConnectivityFaceSelectOptions(connectivityFaces),
    ];
  }, [connectivityFaces, t, fromEquipmentId]);

  const fromConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceConnectionSelectOptions(
        fromConnectivityFaceConnections
      ),
    ];
  }, [fromConnectivityFaceConnections, t]);

  const toConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceConnectionSelectOptions(
        toConnectivityFaceConnections
      ),
    ];
  }, [toConnectivityFaceConnections, t]);

  const maxAvailableConnectionsCount = useMemo(() => {
    if (
      !fromConnectivityFaceConnections ||
      !toConnectivityFaceConnections ||
      !fromPositionId ||
      !toPositionId
    )
      return 0;

    return findAvailableCountFaceConnections(
      fromConnectivityFaceConnections,
      toConnectivityFaceConnections,
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
      !fromConnectivityFaceConnections ||
      !toConnectivityFaceConnections ||
      !fromPositionId ||
      !toPositionId ||
      !numberOfConnections ||
      !jumps
    )
      return [];

    const available = getAvailableConnections(
      fromConnectivityFaceConnections,
      toConnectivityFaceConnections,
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
            options={fromConnectivityFaceOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => handleSetFromEquipmentId(x as string)}
            selected={fromEquipmentId}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_EQUIPMENT")}>
          <SelectMenu
            options={toConnectivityFaceOptions}
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
          connectivityFaces
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
