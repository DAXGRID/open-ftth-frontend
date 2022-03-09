import { useReducer, useEffect, useMemo } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation, TFunction } from "react-i18next";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import DefaultButton from "../../../components/DefaultButton";
import LabelContainer from "../../../components/LabelContainer";
import {
  queryTerminalEquipmentDetails,
  TerminalEquipment,
  queryTerminalEquipmentSpecifications,
  Manufacturer,
  TerminalEquipmentSpecification,
} from "./EditTerminalEquipmentGql";

function categoryToOptions(
  specs: TerminalEquipmentSpecification[],
  isRackEquipment: boolean
): SelectOption[] {
  return [
    ...new Set(
      specs
        .filter((x) => x.isRackEquipment === isRackEquipment)
        .map((x) => x.category)
    ),
  ].map((x, i) => ({
    text: x,
    value: x,
    key: i,
  }));
}

function specificationToOptions(
  specs: TerminalEquipmentSpecification[],
  category: string,
  isRackEquipment: boolean
): SelectOption[] {
  return specs
    .filter((x) => x.isRackEquipment === isRackEquipment)
    .filter((x) => x.category === category)
    .map((x) => ({ text: x.name, value: x.id, key: x.id }));
}

function manufacturerToOptions(
  specs: Manufacturer[],
  refs: string[]
): SelectOption[] {
  return specs
    .filter((x) => refs.findIndex((y) => y === x.id))
    .map((x) => ({ text: x.name, value: x.id, key: x.id }));
}

interface State {
  categoryName: string | null;
  specificationId: string | null;
  manufacturerId: string | null;
  name: string | null;
  terminalEquipment: TerminalEquipment | null;
  manufacturers: Manufacturer[] | null;
  terminalEquipmentSpecifications: TerminalEquipmentSpecification[] | null;
}

const initialState: State = {
  categoryName: null,
  specificationId: null,
  manufacturerId: null,
  name: null,
  terminalEquipment: null,
  manufacturers: null,
  terminalEquipmentSpecifications: null,
};

type Action =
  | { type: "setTerminalEquipment"; terminalEquipment: TerminalEquipment }
  | { type: "setManufacturers"; manufacturers: Manufacturer[] }
  | {
      type: "setTerminalEquipmentSpecifications";
      specifications: TerminalEquipmentSpecification[];
    }
  | { type: "setCategoryName"; name: string }
  | { type: "setSpecificationId"; id: string }
  | { type: "setManufacturerId"; id: string }
  | { type: "setName"; name: string }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setTerminalEquipment":
      return { ...state, terminalEquipment: action.terminalEquipment };
    case "setManufacturers":
      return { ...state, manufacturers: action.manufacturers };
    case "setTerminalEquipmentSpecifications":
      return {
        ...state,
        terminalEquipmentSpecifications: action.specifications,
      };
    case "setCategoryName":
      return { ...state, categoryName: action.name };
    case "setSpecificationId":
      return { ...state, specificationId: action.id };
    case "setManufacturerId":
      return { ...state, manufacturerId: action.id };
    case "setName":
      return { ...state, name: action.name };
    case "reset":
      return initialState;
    default:
      throw new Error(
        `No action found of type: '${
          (action as any)?.type ?? "has no action type"
        }'`
      );
  }
}

interface EditTerminalEquipmentProps {
  terminalEquipmentId: string;
}

function EditTerminalEquipment({
  terminalEquipmentId,
}: EditTerminalEquipmentProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();
  const client = useClient();

  useEffect(() => {
    if (!terminalEquipmentId) return;
    queryTerminalEquipmentDetails(client, terminalEquipmentId)
      .then((r) => {
        const terminalEquipment = r.data?.utilityNetwork.terminalEquipment;
        if (terminalEquipment) {
          dispatch({
            type: "setTerminalEquipment",
            terminalEquipment: terminalEquipment,
          });
          dispatch({
            type: "setCategoryName",
            name: terminalEquipment.specification.category,
          });
          dispatch({
            type: "setSpecificationId",
            id: terminalEquipment.specification.id,
          });
          dispatch({
            type: "setManufacturerId",
            id: terminalEquipment.manufacturer?.id ?? "",
          });
          dispatch({
            type: "setName",
            name: terminalEquipment.name,
          });
        } else {
          toast.error(t("ERROR"));
        }
      })
      .catch((r) => {
        console.error(r);
        toast.error(t("ERROR"));
      });
  }, [terminalEquipmentId, dispatch, client, t]);

  useEffect(() => {
    queryTerminalEquipmentSpecifications(client)
      .then((r) => {
        if (r.data?.utilityNetwork) {
          const { manufacturers, terminalEquipmentSpecifications } =
            r.data.utilityNetwork;
          dispatch({
            type: "setTerminalEquipmentSpecifications",
            specifications: terminalEquipmentSpecifications,
          });
          dispatch({
            type: "setManufacturers",
            manufacturers: manufacturers,
          });
        } else {
          t("ERROR");
        }
      })
      .catch((r) => {
        console.error(r);
        toast.error(t("ERROR"));
      });
  }, [dispatch, t, client]);

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (!state.terminalEquipment || !state.terminalEquipmentSpecifications)
      return [];

    return categoryToOptions(
      state.terminalEquipmentSpecifications,
      state.terminalEquipment.specification.isRackEquipment
    );
  }, [state.terminalEquipment, state.terminalEquipmentSpecifications]);

  const specificationOptions = useMemo<SelectOption[]>(() => {
    if (
      !state.terminalEquipmentSpecifications ||
      !state.categoryName ||
      !state.terminalEquipment
    )
      return [];

    return specificationToOptions(
      state.terminalEquipmentSpecifications,
      state.categoryName,
      state.terminalEquipment.specification.isRackEquipment
    );
  }, [
    state.terminalEquipmentSpecifications,
    state.categoryName,
    state.terminalEquipment,
  ]);

  const manufacturerOptions = useMemo<SelectOption[]>(() => {
    if (!state.manufacturers || !state.terminalEquipmentSpecifications)
      return [];

    return [
      { text: t("UNSPECIFIED"), value: "", key: "-1" },
      ...manufacturerToOptions(
        state.manufacturers,
        state.terminalEquipmentSpecifications.find(
          (x) => x.id === state.specificationId
        )?.manufacturerRefs ?? []
      ),
    ];
  }, [
    state.manufacturers,
    state.terminalEquipmentSpecifications,
    state.specificationId,
    t,
  ]);

  if (!state.terminalEquipment || !state.specificationId || !state.categoryName)
    return <></>;

  return (
    <div className="edit-terminal-equipment">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text={`${t("CATEGORY")}:`}>
            <SelectMenu
              onSelected={() => {}}
              options={categoryOptions}
              selected={state.categoryName}
              disabled={true}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("SPECIFICATION")}:`}>
            <SelectMenu
              onSelected={(x) =>
                dispatch({ type: "setSpecificationId", id: x as string })
              }
              options={specificationOptions}
              selected={state.specificationId}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("MANUFACTURER")}:`}>
            <SelectMenu
              onSelected={(x) =>
                dispatch({ type: "setManufacturerId", id: x as string })
              }
              options={manufacturerOptions}
              selected={state.manufacturerId ?? ""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("NAME")}:`}>
            <TextBox
              value={state.name ?? ""}
              setValue={(x) => dispatch({ type: "setName", name: x })}
            />
          </LabelContainer>
        </div>
      </div>

      <div className="full-row">
        <DefaultButton
          onClick={() => {}}
          innerText={t("UPDATE")}
          disabled={true}
        />
      </div>
    </div>
  );
}

export default EditTerminalEquipment;
