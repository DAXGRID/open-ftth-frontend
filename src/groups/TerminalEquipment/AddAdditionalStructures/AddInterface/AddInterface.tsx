import { useReducer, useEffect, useMemo } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import NullableNumberPicker from "../../../../components/NullableNumberPicker";
import LabelContainer from "../../../../components/LabelContainer";
import TextBox from "../../../../components/TextBox";
import SelectMenu, { SelectOption } from "../../../../components/SelectMenu";
import DefaultButton from "../../../../components/DefaultButton";
import {
  getTerminalStructureSpecifications,
  TerminalStructureSpecification,
  addInterface,
  getNextPhysicalCircuitId,
} from "./AddInterfaceGql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

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

interface State {
  category: string | null;
  specificationId: string | null;
  interfaceType: string | null;
  slotNumber: number | null;
  subSlotNumber: number | null;
  portNumber: number | null;
  terminalStructureSpecifications: TerminalStructureSpecification[];
  circuitName: string | null;
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
};

interface AddInterfaceParams {
  routeNodeId: string;
  terminalEquipmentId: string;
}

function AddInterface({
  routeNodeId,
  terminalEquipmentId,
}: AddInterfaceParams) {
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

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (state.terminalStructureSpecifications) {
      return createCategoryOptions(
        state.terminalStructureSpecifications.filter(
          (x) => x.isInterfaceModule,
        ),
        t,
      ).sort((x, y) => (x.text > y.text ? 1 : -1));
    } else {
      return [];
    }
  }, [state.terminalStructureSpecifications, t]);

  const specificationOptions = useMemo<SelectOption[]>(() => {
    if (state.terminalStructureSpecifications && state.category) {
      return createSpecificationOptions(
        state.terminalStructureSpecifications.filter(
          (x) => x.isInterfaceModule,
        ),
        state.category,
      ).sort((x, y) => (x.text > y.text ? 1 : -1));
    } else {
      return [];
    }
  }, [state.terminalStructureSpecifications, state.category]);

  function executeGetNextPhysicalCircuitId() {
    getNextPhysicalCircuitId(client).then((x) => {
      const nextPhysicalCircuitId =
        x.data?.utilityNetwork.getNextPhysicalCircuitId;
      if (nextPhysicalCircuitId) {
        dispatch({
          type: "setCircuitName",
          curcuitName: nextPhysicalCircuitId,
        });
      } else {
        console.error("Could not load next physical circuit id.");
        toast.error(t("ERROR"));
      }
    });
  }

  function executeAddInterface() {
    if (state.specificationId === null) {
      console.error("the specification id was not set.");
      toast.error(t("ERROR"));
      return;
    }

    const interfaceInfo =
      state.interfaceType ||
      state.slotNumber ||
      state.subSlotNumber ||
      state.circuitName ||
      state.portNumber
        ? {
            interfaceType: state.interfaceType,
            slotNumber: state.slotNumber,
            subSlotNumber: state.subSlotNumber,
            portNumber: state.portNumber,
            circuitName: state.circuitName,
          }
        : null;

    addInterface(client, {
      routeNodeId: routeNodeId,
      terminalEquipmentId: terminalEquipmentId,
      structureSpecificationId: state.specificationId,
      interfaceInfo: interfaceInfo,
    })
      .then((response) => {
        if (response.data?.terminalEquipment.addInterface.isSuccess) {
          dispatch({
            type: "setCircuitName",
            curcuitName: null,
          });
          toast.success(t("ADDED"));
        } else {
          console.error(response);
          toast.error(
            t(
              response.data?.terminalEquipment.addInterface.errorCode ??
                "ERROR",
            ),
          );
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("ERROR"));
      });
  }

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
            <div className="circuit-name-group">
              <TextBox
                setValue={(x) =>
                  dispatch({ type: "setCircuitName", curcuitName: x })
                }
                value={state.circuitName ?? ""}
              />
              <span
                role="button"
                className="circuit-name-button header-icons__icon"
                onClick={executeGetNextPhysicalCircuitId}
              >
                <FontAwesomeIcon icon={faRefresh} />
              </span>
            </div>
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
          <DefaultButton onClick={executeAddInterface} innerText={t("ADD")} />
        </div>
      </div>
    </div>
  );
}

export default AddInterface;
