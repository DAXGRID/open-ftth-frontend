import { useMemo, useState, useEffect } from "react";
import { useClient } from "urql";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import LabelContainer from "../../components/LabelContainer";
import DefaultButton from "../../components/DefaultButton";
import NumberPicker from "../../components/NumberPicker";
import EquipmentSelector from "./EquipmentSelector";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  getConnectivityFaceConnections,
  ConnectivityFace,
  ConnectivityFaceConnection,
  getConnectivityFaces,
  connectToTerminalEquipment,
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

function jumpsSequence(count: number): SelectOption[] {
  if (count === 0) return [{ text: "0", value: 0, key: 0 }];

  const result = [];
  for (let i = 0; i < count; i++) {
    if (count % i === 0) {
      result.push({ text: i.toString(), value: i, key: i });
    }
  }

  return result;
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
  // ??? im not sure why this is needed does not update without it
  const fromFiltered = from.filter((x) => x);
  const toFiltered = to.filter((x) => x);
  // end of something weird

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

    let i = 0;
    const jumpEachTime = (jumps / count) % 2 === 0 ? jumps : jumps / 2;
    while (jumpedConnections.length !== count) {
      jumpedConnections.push(fromRest[i]);
      jumpedConnections.push(fromRest[i + jumps]);

      i++;
      const rem = i % jumps;
      if (rem === 0) {
        i += jumpEachTime;
      }
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
  // ??? im not sure why this is needed does not update without it
  const fromFiltered = from.filter((x) => x);
  const toFiltered = to.filter((x) => x);
  // end of something weird

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
  maxFromEquipmentCount: number,
  numberToConnect: number,
  currentIndex: number
) {
  if (!maxFromEquipmentCount || !numberToConnect) return 1;
  if (numberToConnect === 1) return 1;
  if (numberToConnect % 2 !== 0) return 1;
  return maxFromEquipmentCount - Math.floor(numberToConnect / 2);
}

function getCombinedEquipmentId({
  equipmentId,
  faceKind,
}: {
  equipmentId: string;
  faceKind: string;
}) {
  return `${equipmentId}_${faceKind}`;
}

function getRootEquipmentId(combinedEquipmentId: string) {
  const splitted = combinedEquipmentId.split("_");
  return splitted[0];
}

interface FiberConnectionEditorProps {
  routeNodeId: string;
  terminalId: string | null;
  faceKind: "PATCH_SIDE" | "SPLICE_SIDE";
  terminalEquipmentOrRackId: string;
  side: "A" | "Z" | null;
}

function FiberConnectionEditor({
  routeNodeId,
  faceKind,
  terminalId,
  terminalEquipmentOrRackId,
  side,
}: FiberConnectionEditorProps) {
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
    if (!faceKind || !terminalId || !terminalEquipmentOrRackId || !side) return;

    var equipmentId = getCombinedEquipmentId({
      equipmentId: terminalEquipmentOrRackId,
      faceKind: faceKind,
    });

    if (side === "A") {
      setToEquipmentId(equipmentId);
      setToPositionId(terminalId);
    } else if (side === "Z") {
      setFromEquipmentId(equipmentId);
      setFromPositionId(terminalId);
    } else {
      throw Error(`Could not handle faceKind '${faceKind}'`);
    }
  }, [
    side,
    faceKind,
    terminalId,
    terminalEquipmentOrRackId,
    setFromEquipmentId,
    setToEquipmentId,
    setFromPositionId,
    setToPositionId,
  ]);

  useEffect(() => {
    getConnectivityFaces(client, routeNodeId).then((response) => {
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
    if (!fromEquipmentId || connectivityFaces?.length === 0) return;

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
    if (!toEquipmentId || connectivityFaces?.length === 0) return;

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
        throw Error(`Could not load face connections on id '${toEquipmentId}'`);
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
    const toEquipment = connectivityFaces.find(
      (x) => getCombinedEquipmentId(x) === toEquipmentId
    );

    if (toEquipment && toEquipment.equipmentKind === "TERMINAL_EQUIPMENT") {
      if (toEquipment.faceKind === "PATCH_SIDE") {
        return [
          defaultOption,
          ...createConnectivityFaceSelectOptions(
            connectivityFaces.filter(
              (x) => x.equipmentKind === "TERMINAL_EQUIPMENT"
            )
          ),
        ];
      } else if (toEquipment.faceKind === "SPLICE_SIDE") {
        return [
          defaultOption,
          ...createConnectivityFaceSelectOptions(
            connectivityFaces.filter(
              (x) => x.equipmentKind === "SPAN_EQUIPMENT"
            )
          ),
        ];
      } else {
        throw Error(
          `Could not handle faceKind being '${toEquipment.faceKind}'`
        );
      }
    } else {
      return [
        defaultOption,
        ...createConnectivityFaceSelectOptions(
          connectivityFaces.filter(
            (x) => x.equipmentKind === "TERMINAL_EQUIPMENT"
          )
        ),
      ];
    }
  }, [connectivityFaces, t, toEquipmentId]);

  const toConnectivityFaceOptions = useMemo<SelectOption[]>(() => {
    const defaultOption = { text: t("CHOOSE"), value: "", key: "0" };
    const fromEquipment = connectivityFaces.find(
      (x) => getCombinedEquipmentId(x) === fromEquipmentId
    );

    if (fromEquipment && fromEquipment.equipmentKind === "TERMINAL_EQUIPMENT") {
      if (fromEquipment.faceKind === "PATCH_SIDE") {
        return [
          defaultOption,
          ...createConnectivityFaceSelectOptions(
            connectivityFaces.filter(
              (x) => x.equipmentKind === "TERMINAL_EQUIPMENT"
            )
          ),
        ];
      } else if (fromEquipment.faceKind === "SPLICE_SIDE") {
        return [
          defaultOption,
          ...createConnectivityFaceSelectOptions(
            connectivityFaces.filter(
              (x) => x.equipmentKind === "SPAN_EQUIPMENT"
            )
          ),
        ];
      } else {
        throw Error(
          `Could not handle faceKind being '${fromEquipment.faceKind}'`
        );
      }
    } else {
      return [
        defaultOption,
        ...createConnectivityFaceSelectOptions(
          connectivityFaces.filter(
            (x) => x.equipmentKind === "TERMINAL_EQUIPMENT"
          )
        ),
      ];
    }
  }, [connectivityFaces, t, fromEquipmentId]);

  useEffect(() => {
    if (
      !fromEquipmentId ||
      fromConnectivityFaceOptions.filter((x) => x.value !== "").length === 0
    )
      return;
    const found = fromConnectivityFaceOptions.find(
      (x) => x.value === fromEquipmentId
    );
    if (!found) {
      setFromEquipmentId("");
      setFromPositionId("");
    }
  }, [
    fromConnectivityFaceOptions,
    fromEquipmentId,
    setFromEquipmentId,
    setFromPositionId,
    toEquipmentId,
  ]);

  useEffect(() => {
    if (
      !toEquipmentId ||
      toConnectivityFaceOptions.filter((x) => x.value !== "").length === 0
    )
      return;
    const found = toConnectivityFaceOptions.find(
      (x) => x.value === toEquipmentId
    );
    if (!found) {
      setToEquipmentId("");
      setToPositionId("");
    }
  }, [
    toConnectivityFaceOptions,
    toEquipmentId,
    setToEquipmentId,
    setToPositionId,
    fromEquipmentId,
  ]);

  const fromConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    if (fromEquipmentId) {
      return [
        { text: t("CHOOSE"), value: "", key: "0" },
        ...createConnectivityFaceConnectionSelectOptions(
          fromConnectivityFaceConnections
        ),
      ];
    } else {
      return [{ text: t("CHOOSE"), value: "", key: "0" }];
    }
  }, [fromConnectivityFaceConnections, t, fromEquipmentId]);

  const toConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    if (toEquipmentId) {
      return [
        { text: t("CHOOSE"), value: "", key: "0" },
        ...createConnectivityFaceConnectionSelectOptions(
          toConnectivityFaceConnections
        ),
      ];
    } else {
      return [{ text: t("CHOOSE"), value: "", key: "0" }];
    }
  }, [toConnectivityFaceConnections, t, toEquipmentId]);

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
      fromConnectivityFaceConnections.length,
      numberOfConnections,
      fromConnectivityFaceConnections.findIndex(
        (x) => x.terminalOrSegmentId === fromPositionId
      )
    );
  }, [numberOfConnections, fromConnectivityFaceConnections, fromPositionId]);

  const connectionRows = useMemo(() => {
    if (
      !fromConnectivityFaceConnections ||
      !toConnectivityFaceConnections ||
      !fromPositionId ||
      !toPositionId ||
      !numberOfConnections ||
      !jumps ||
      fromConnectivityFaceConnections.length === 0 ||
      toConnectivityFaceConnections.length === 0
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

  const executeConnectToTerminalEquipment = () => {
    const fromEquipId = getRootEquipmentId(fromEquipmentId);
    const toEquipId = getRootEquipmentId(toEquipmentId);
    const from = connectivityFaces.find((x) => x.equipmentId === fromEquipId);
    const to = connectivityFaces.find((x) => x.equipmentId === toEquipId);

    if (!from || !to) {
      throw Error("Could not find from or to in connectivity faces.");
    }

    if (
      (from.equipmentKind === "SPAN_EQUIPMENT" &&
        to.equipmentKind === "TERMINAL_EQUIPMENT") ||
      (from.equipmentKind === "TERMINAL_EQUIPMENT" &&
        to.equipmentKind === "SPAN_EQUIPMENT")
    ) {
      const isFromSpanEquipment = from.equipmentKind === "SPAN_EQUIPMENT";

      const spanSegmentIds = isFromSpanEquipment
        ? connectionRows.map((x) => x.from.id)
        : connectionRows.map((x) => x.to.id);

      const terminalIds = isFromSpanEquipment
        ? connectionRows.map((x) => x.to.id)
        : connectionRows.map((x) => x.from.id);

      const connects = spanSegmentIds.map((x, i) => ({
        spanSegmentId: x,
        terminalId: terminalIds[i],
      }));

      connectToTerminalEquipment(client, {
        routeNodeId: routeNodeId,
        connects: connects,
      })
        .then((response) => {
          if (
            response.data?.spanEquipment.connectToTerminalEquipment.isSuccess
          ) {
            toast.success(t("CONNECTION_ESTABLISHED"));
          } else {
            toast.error(
              t(
                response.data?.spanEquipment.connectToTerminalEquipment
                  .errorCode ?? "ERROR"
              )
            );
          }
        })
        .catch(() => {
          toast.error(t("ERROR"));
        });
    }
  };

  const canExecuteConnectToTerminal = (): boolean => {
    const notConnectedRows = connectionRows.filter(
      (x) => !x.from.isConnected && !x.to.isConnected
    ).length;
    return notConnectedRows === numberOfConnections;
  };

  return (
    <div className="fiber-connection-editor">
      <div className="full-row full-row gap-default">
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
      <div className="full-row full-row gap-default">
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
      <div className="full-row gap-default">
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
            options={jumpsSequence(numberOfConnections)}
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
          disabled={!canExecuteConnectToTerminal()}
          innerText={t("CONNECT")}
          maxWidth="500px"
          onClick={() => {
            executeConnectToTerminalEquipment();
          }}
        />
      </div>
    </div>
  );
}

export default FiberConnectionEditor;
