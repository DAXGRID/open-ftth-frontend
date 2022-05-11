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
  connectTerminals,
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

function terminalEquipmentToTerminalEquipment(
  from: ConnectivityFace,
  to: ConnectivityFace
): boolean {
  return (
    from.equipmentKind === "TERMINAL_EQUIPMENT" &&
    to.equipmentKind === "TERMINAL_EQUIPMENT"
  );
}

function spanEquipmentToTerminalEquipment(
  from: ConnectivityFace,
  to: ConnectivityFace
): boolean {
  return (
    (from.equipmentKind === "SPAN_EQUIPMENT" &&
      to.equipmentKind === "TERMINAL_EQUIPMENT") ||
    (from.equipmentKind === "TERMINAL_EQUIPMENT" &&
      to.equipmentKind === "SPAN_EQUIPMENT")
  );
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

function range(from: number, to: number, jumps: number): number[] {
  const r = [];
  for (let i = from; i < to; i += jumps) {
    r.push(i);
  }
  return r;
}

function partition<T>(n: number, c: T[]): T[][] {
  const output = [];
  for (var i = 0; i < c.length; i += n) {
    output[output.length] = [...c].slice(i, i + n);
  }
  return output;
}

function interleave(arr: any[], arr2: any[]) {
  return arr.reduce((combArr, elem, i) => combArr.concat(elem, arr2[i]), []);
}

function connectionSequence(count: number, jumps: number): number[] {
  const r: number[] = [];
  if (jumps === 1) {
    return range(1, count + 1, 1);
  } else {
    const partitions = partition<number>(2, range(1, count, jumps));
    for (let i = 0; i < partitions.length; i++) {
      const lower = partitions[i][0];
      const upper = partitions[i][1];
      const diff = upper - lower;
      r.push(interleave(range(lower, upper, 1), range(upper, upper + diff, 1)));
    }
  }
  return r.flat();
}

function getAvailableConnections(
  from: ConnectivityFaceConnection[],
  to: ConnectivityFaceConnection[],
  fromId: string,
  toId: string,
  count: number,
  jumps: number
): { from: ConnectivityFaceConnection[]; to: ConnectivityFaceConnection[] } {
  const fromIndex = from.findIndex((x) => x.terminalOrSegmentId === fromId);
  const toIndex = to.findIndex((x) => x.terminalOrSegmentId === toId);

  let fromAvailable: ConnectivityFaceConnection[] = [];
  const toAvailable = [...to].splice(toIndex, count);
  if (jumps <= 1) {
    fromAvailable = [...from].splice(fromIndex, count);
  } else {
    const jumpedConnections: ConnectivityFaceConnection[] = [];
    const sequence = connectionSequence(from.length, jumps);
    for (const i of [...sequence].splice(sequence.indexOf(fromIndex + 1))) {
      if (i > from.length) {
        break;
      } else {
        jumpedConnections.push(from[i - 1]);
      }
    }
    fromAvailable = [...jumpedConnections].splice(0, count);
  }

  return { from: [...fromAvailable], to: [...toAvailable] };
}

function findAvailableCountFaceConnections(
  from: ConnectivityFaceConnection[],
  to: ConnectivityFaceConnection[],
  fromId: string,
  toId: string
): number {
  const fromIndex = from.findIndex((x) => x.terminalOrSegmentId === fromId);
  const toIndex = to.findIndex((x) => x.terminalOrSegmentId === toId);
  const fromAvailableCount = [...from].splice(fromIndex).length;
  const toAvailableCount = [...to].splice(toIndex).length;

  return fromAvailableCount > toAvailableCount
    ? toAvailableCount
    : fromAvailableCount;
}

function findAvailableJumps(
  maxFromEquipmentCount: number,
  numberToConnect: number
) {
  if (!maxFromEquipmentCount || !numberToConnect) return 1;
  if (numberToConnect === 1) return 1;
  return maxFromEquipmentCount - 2;
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

type FaceKind = "PATCH_SIDE" | "SPLICE_SIDE";

interface FiberConnectionEditorProps {
  routeNodeId: string;
  terminalId: string | null;
  faceKind: FaceKind;
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
  const [fiberCoordLength, setCoord] = useState(0);
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
      return [
        defaultOption,
        ...createConnectivityFaceSelectOptions(connectivityFaces),
      ];
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
      return [
        defaultOption,
        ...createConnectivityFaceSelectOptions(connectivityFaces),
      ];
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
      numberOfConnections
    );
  }, [numberOfConnections, fromConnectivityFaceConnections]);

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

  const getConnectivityFace = (id: string): ConnectivityFace | null => {
    const rootEquipmentId = getRootEquipmentId(id);
    return (
      connectivityFaces.find((x) => x.equipmentId === rootEquipmentId) ?? null
    );
  };

  const getSelectedFromEquipment = (): ConnectivityFace | null => {
    return getConnectivityFace(fromEquipmentId);
  };

  const getSelectedToEquipment = (): ConnectivityFace | null => {
    return getConnectivityFace(toEquipmentId);
  };

  const selectedSpanEquipmentToTerminalEquipment = (): boolean => {
    const from = getSelectedFromEquipment();
    const to = getSelectedToEquipment();
    return !!from && !!to && spanEquipmentToTerminalEquipment(from, to);
  };

  const selectedTerminalEquipmentToTerminalEquipment = (): boolean => {
    const from = getSelectedFromEquipment();
    const to = getSelectedToEquipment();
    return !!from && !!to && terminalEquipmentToTerminalEquipment(from, to);
  };

  const executeConnectToTerminalEquipment = () => {
    const from = getSelectedFromEquipment();
    const to = getSelectedToEquipment();

    if (!from || !to) {
      throw Error("Could not find from or to in connectivity faces.");
    }

    if (spanEquipmentToTerminalEquipment(from, to)) {
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
    } else if (terminalEquipmentToTerminalEquipment(from, to)) {
      if (connectionRows.length > 1) {
        toast.error(t("ERROR"));
        console.error("To many connection-rows, something is wrong.");
        return;
      }

      const connectionRow =
        connectionRows.length > 0 ? connectionRows[0] : null;

      if (!connectionRow) {
        toast.error(t("ERROR"));
        console.error("No connection rows.");
        return;
      }

      connectTerminals(client, {
        routeNodeId: routeNodeId,
        fiberCoordLength: fiberCoordLength,
        fromTerminalId: connectionRow.from.id,
        toTerminalId: connectionRow.to.id,
      }).then((response) => {
        const body = response.data?.terminalEquipment.connectTerminals;
        if (body?.isSuccess) {
          toast.success(t("CONNECTION_ESTABLISHED"));
        } else {
          toast.error(t(body?.errorCode ?? "ERROR"));
        }
      });
    }
  };

  const canExecuteConnectToTerminal = (): boolean => {
    const notConnectedRows = connectionRows.filter(
      (x) => !x.from.isConnected && !x.to.isConnected && x.from.id !== x.to.id
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
        {selectedSpanEquipmentToTerminalEquipment() && (
          <>
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
            </LabelContainer>{" "}
          </>
        )}
        {selectedTerminalEquipmentToTerminalEquipment() && (
          <>
            <LabelContainer text={t("PATCH/PIGTAIL_COORD_LENGTH_CM")}>
              <NumberPicker
                minWidth="250px"
                setValue={(x) => setCoord(x)}
                value={fiberCoordLength}
              />
            </LabelContainer>
            {/* Start dummy block */}
            <LabelContainer text={""}>
              <></>
            </LabelContainer>
            {/* End dummy block */}
          </>
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
