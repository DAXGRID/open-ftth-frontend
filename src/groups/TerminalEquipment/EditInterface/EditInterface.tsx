import { useReducer, useEffect, useMemo } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import NullableNumberPicker from "../../../components/NullableNumberPicker";
import NumberPicker from "../../../components/NumberPicker";
import LabelContainer from "../../../components/LabelContainer";
import TextBox from "../../../components/TextBox";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import DefaultButton from "../../../components/DefaultButton";
import {
  getTerminalStructureSpecifications,
  TerminalStructureSpecification,
  editInterface,
  getTerminalStructure,
} from "./EditInterfaceGql";

function createCategoryOptions(
  specifications: TerminalStructureSpecification[],
  t: TFunction,
): SelectOption[] {
  return specifications.reduce<SelectOption[]>((acc, x) => {
    if (acc.findIndex((z) => z.value === x.category) === -1) {
      acc.push({ text: t(x.category), value: x.category, key: x.category });
    }
    return acc;
  }, []);
}

function createSpecificationOptions(
  specifications: TerminalStructureSpecification[],
  category: string,
): SelectOption[] {
  return specifications
    .filter((x) => x.category === category)
    .map((x) => ({ text: x.name, value: x.id, key: x.id }));
}

interface TerminalStructure {
  id: string;
  name: string;
  description: string;
  position: number;
  category: string;
  specificationId: string;
  interfaceInfo: {
    interfaceType: string | null;
    slotNumber: number | null;
    subSlotNumber: number | null;
    circuitName: string | null;
    portNumber: number | null;
  } | null;
}

interface State {
  category: string | null;
  specificationId: string | null;
  interfaceType: string | null;
  slotNumber: number | null;
  subSlotNumber: number | null;
  portNumber: number | null;
  terminalStructureSpecifications: TerminalStructureSpecification[];
  circuitName: string | null;
  position: number;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setCategory":
      return { ...state, category: action.category, specificationId: null };
    case "setSpecificationId":
      return { ...state, specificationId: action.id };
    case "setInterfaceType":
      return { ...state, interfaceType: action.interfaceType };
    case "setSlotNumber":
      return { ...state, slotNumber: action.slotNumber };
    case "setSubSlotNumber":
      return { ...state, subSlotNumber: action.subSlotNumber };
    case "setPortNumber":
      return { ...state, portNumber: action.portNumber };
    case "setCircuitName":
      return { ...state, circuitName: action.curcuitName };
    case "setPosition":
      return { ...state, position: action.position };
    case "setTerminalStructure":
      return {
        ...state,
        specificationId: action.terminalStructure.specificationId,
        interfaceType:
          action.terminalStructure.interfaceInfo?.interfaceType ?? null,
        subSlotNumber:
          action.terminalStructure.interfaceInfo?.subSlotNumber ?? null,
        circuitName:
          action.terminalStructure.interfaceInfo?.circuitName ?? null,
        slotNumber: action.terminalStructure.interfaceInfo?.slotNumber ?? null,
        category: action.terminalStructure.category,
        position: action.terminalStructure.position,
        portNumber: action.terminalStructure.interfaceInfo?.portNumber ?? null,
      };
    case "setTerminalStructureSpecifications":
      return {
        ...state,
        terminalStructureSpecifications: action.terminalStructureSpecifications,
      };
    default:
      throw new Error(`No action found.`);
  }
}

type Action =
  | { type: "setCategory"; category: string }
  | { type: "setSpecificationId"; id: string }
  | { type: "setInterfaceType"; interfaceType: string }
  | { type: "setSlotNumber"; slotNumber: number | null }
  | { type: "setSubSlotNumber"; subSlotNumber: number | null }
  | { type: "setPortNumber"; portNumber: number | null }
  | { type: "setCircuitName"; curcuitName: string | null }
  | { type: "setTerminalStructure"; terminalStructure: TerminalStructure }
  | { type: "setPosition"; position: number }
  | {
      type: "setTerminalStructureSpecifications";
      terminalStructureSpecifications: TerminalStructureSpecification[];
    };

const initialState: State = {
  category: null,
  specificationId: null,
  interfaceType: null,
  slotNumber: null,
  subSlotNumber: null,
  portNumber: null,
  terminalStructureSpecifications: [],
  circuitName: null,
  position: 0,
};

interface EditInterfaceParams {
  routeNodeId: string;
  terminalEquipmentId: string;
  terminalStructureId: string;
}

function EditInterface({
  routeNodeId,
  terminalEquipmentId,
  terminalStructureId,
}: EditInterfaceParams) {
  const { t } = useTranslation();
  const client = useClient();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getTerminalStructureSpecifications(client).then((x) => {
      const specifications =
        x.data?.utilityNetwork.terminalStructureSpecifications;
      if (specifications) {
        dispatch({
          type: "setTerminalStructureSpecifications",
          terminalStructureSpecifications: specifications,
        });
      } else {
        console.error("Could not load terminal structure specifications.");
        toast.error(t("ERROR"));
      }
    });
  }, [dispatch, client, t]);

  useEffect(() => {
    if (state.terminalStructureSpecifications.length === 0) return;

    getTerminalStructure(client, {
      terminalStructureId,
      terminalEquipmentOrTerminalId: terminalEquipmentId,
    }).then((x) => {
      const terminalStructure = x.data?.utilityNetwork.terminalStructure;
      if (terminalStructure) {
        const category = state.terminalStructureSpecifications.find(
          (x) => x.id === terminalStructure.specificationId,
        )?.category;

        if (!category) {
          console.error(
            `Could not load find category on specification id: ${terminalStructure.specificationId}`,
          );
          toast.error(t("ERROR"));
          return;
        }

        dispatch({
          type: "setTerminalStructure",
          terminalStructure: { ...terminalStructure, category },
        });
      } else {
        console.error("Could not load terminal structure.");
        toast.error(t("ERROR"));
      }
    });
  }, [
    dispatch,
    client,
    t,
    terminalEquipmentId,
    terminalStructureId,
    state.terminalStructureSpecifications,
  ]);

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (state.terminalStructureSpecifications) {
      return createCategoryOptions(
        state.terminalStructureSpecifications,
        t,
      ).sort((x, y) => (x.text > y.text ? 1 : -1));
    } else {
      return [];
    }
  }, [state.terminalStructureSpecifications, t]);

  const specificationOptions = useMemo<SelectOption[]>(() => {
    if (state.terminalStructureSpecifications && state.category) {
      return createSpecificationOptions(
        state.terminalStructureSpecifications,
        state.category,
      ).sort((x, y) => (x.text > y.text ? 1 : -1));
    } else {
      return [];
    }
  }, [state.terminalStructureSpecifications, state.category]);

  const executeEditInterface = () => {
    if (state.specificationId === null) {
      console.error("the specification id was not set.");
      toast.error(t("ERROR"));
      return;
    }

    const interfaceInfo =
      state.interfaceType ||
      state.slotNumber ||
      state.subSlotNumber ||
      state.portNumber
        ? {
            interfaceType: state.interfaceType,
            slotNumber: state.slotNumber,
            subSlotNumber: state.subSlotNumber,
            portNumber: state.portNumber,
            circuitName: state.circuitName,
          }
        : null;

    editInterface(client, {
      terminalEquipmentId: terminalEquipmentId,
      position: state.position,
      terminalStructureId: terminalStructureId,
      terminalStructureSpecificationId: state.specificationId,
      interfaceInfo: interfaceInfo,
    })
      .then((response) => {
        if (
          response.data?.terminalEquipment.updateTerminalStructureProperties
            .isSuccess
        ) {
          toast.success(t("UPDATED"));
        } else {
          console.error(response);
          toast.error(
            t(
              response.data?.terminalEquipment.updateTerminalStructureProperties
                .errorCode ?? "ERROR",
            ),
          );
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("ERROR"));
      });
  };

  return (
    <div className="add-interface">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text={`${t("CATEGORY")}:`}>
            <SelectMenu
              options={categoryOptions}
              autoSelectFirst
              enableSearch
              onSelected={(x) =>
                dispatch({
                  type: "setCategory",
                  category: x?.toString() ?? "",
                })
              }
              selected={state.category ?? ""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("SPECIFICATION")}:`}>
            <SelectMenu
              options={specificationOptions}
              enableSearch
              autoSelectFirst
              onSelected={(x) =>
                dispatch({
                  type: "setSpecificationId",
                  id: x?.toString() ?? "",
                })
              }
              selected={state.specificationId ?? ""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("POSITION")}:`}>
            <NumberPicker
              minValue={1}
              maxValue={100}
              setValue={(x) =>
                dispatch({
                  type: "setPosition",
                  position: x,
                })
              }
              value={state.position}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("INTERFACE_TYPE")}:`}>
            <TextBox
              setValue={(x) =>
                dispatch({ type: "setInterfaceType", interfaceType: x })
              }
              value={state.interfaceType ?? ""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("CIRCUIT_NAME")}:`}>
            <TextBox
              setValue={(x) =>
                dispatch({ type: "setCircuitName", curcuitName: x })
              }
              value={state.circuitName ?? ""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("SLOT_NUMBER")}:`}>
            <NullableNumberPicker
              minValue={0}
              maxValue={100}
              setValue={(x) =>
                dispatch({
                  type: "setSlotNumber",
                  slotNumber: x,
                })
              }
              value={state.slotNumber}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("SUB_SLOT_NUMBER")}:`}>
            <NullableNumberPicker
              minValue={0}
              maxValue={100}
              setValue={(x) =>
                dispatch({
                  type: "setSubSlotNumber",
                  subSlotNumber: x,
                })
              }
              value={state.subSlotNumber}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("PORT_NUMBER")}:`}>
            <NullableNumberPicker
              minValue={0}
              maxValue={1000}
              setValue={(x) =>
                dispatch({
                  type: "setPortNumber",
                  portNumber: x,
                })
              }
              value={state.portNumber}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <DefaultButton innerText={t("EDIT")} onClick={executeEditInterface} />
        </div>
      </div>
    </div>
  );
}

export default EditInterface;
