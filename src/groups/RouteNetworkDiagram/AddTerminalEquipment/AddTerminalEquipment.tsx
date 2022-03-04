import { useEffect, useReducer, useMemo } from "react";
import { useClient, useQuery } from "urql";
import { toast } from "react-toastify";
import { useTranslation, TFunction } from "react-i18next";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import DefaultButton from "../../../components/DefaultButton";
import NumberPicker from "../../../components/NumberPicker";
import LabelContainer from "../../../components/LabelContainer";
import {
  PlacementMethod,
  QUERY_TERMINAL_EQUIPMENT,
  TerminalEquipmentSpecification,
  SpanEquipmentSpecificationsResponse,
  Manufacturer,
  QUERY_RACK,
  RackResponse,
  PlaceTerminalEquipmentInNodeContainerParams,
  PLACE_TERMINAL_EQUIPMENT_IN_NODE_CONTAINER,
  PlaceTerminalEquipmentInNodeContainerResponse,
  NamingMethod,
  NEAREST_ACCESS_ADDRESSES_QUERY,
  NearestAccessAddressesResponse,
  NearestAccessAddress,
  UnitAddress,
} from "./AddTerminalEquipmentGql";

function accessAddressToOption(
  nearestAccessAddress: NearestAccessAddress,
  t: TFunction<"translation">
): SelectOption {
  return {
    text: `${nearestAccessAddress.accessAddress.roadName} ${
      nearestAccessAddress.accessAddress.houseNumber
    } - (${nearestAccessAddress.distance.toFixed(2)} ${t("METER")})`,
    value: nearestAccessAddress.accessAddress.id,
    key: nearestAccessAddress.accessAddress.id,
  };
}

function unitAddressToOption(unitAddress: UnitAddress): SelectOption {
  return {
    text: `${unitAddress.floorName ?? ""} ${unitAddress.suitName ?? ""}`,
    value: unitAddress.id,
    key: unitAddress.id,
  };
}

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
  category: string;
  specification: string;
  manufacturer: string;
  name: string;
  count: number;
  startNumber: number;
  startUnitPosition: number;
  placementMethod: PlacementMethod;
  namingMethod: NamingMethod;
  accessAddressId: string;
  unitAddressId: string;
  addtionalAddressInformation: string;
}

type Action =
  | { type: "setCategory"; id: string }
  | { type: "setSpecification"; id: string }
  | { type: "setManufacturer"; id: string }
  | { type: "setName"; text: string }
  | { type: "setCount"; count: number }
  | { type: "setStartNumber"; startNumber: number }
  | { type: "setStartUnitPosition"; unitPosition: number }
  | { type: "setPlacementMethod"; method: PlacementMethod }
  | { type: "setNamingMethod"; method: NamingMethod }
  | { type: "setAccessAddressId"; id: string }
  | { type: "setUnitAddressId"; id: string }
  | { type: "setAdditionalAddressInformation"; text: string }
  | { type: "reset" };

const initialState: State = {
  category: "",
  specification: "",
  manufacturer: "",
  name: "",
  count: 1,
  startNumber: 1,
  startUnitPosition: 0,
  placementMethod: "TOP_DOWN",
  namingMethod: "NAME_AND_NUMBER",
  accessAddressId: "",
  unitAddressId: "",
  addtionalAddressInformation: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setCategory":
      return {
        ...state,
        category: action.id,
        specification: "",
        manufacturer: "",
      };
    case "setSpecification":
      return { ...state, specification: action.id, manufacturer: "" };
    case "setManufacturer":
      return { ...state, manufacturer: action.id };
    case "setName":
      return { ...state, name: action.text };
    case "setCount":
      return { ...state, count: action.count };
    case "setStartNumber":
      return { ...state, startNumber: action.startNumber };
    case "setStartUnitPosition":
      return { ...state, startUnitPosition: action.unitPosition };
    case "setPlacementMethod":
      return { ...state, placementMethod: action.method };
    case "setNamingMethod":
      return { ...state, namingMethod: action.method };
    case "setAccessAddressId":
      return { ...state, accessAddressId: action.id };
    case "setUnitAddressId":
      return { ...state, unitAddressId: action.id };
    case "setAdditionalAddressInformation":
      return { ...state, addtionalAddressInformation: action.text };
    case "reset":
      return initialState;
    default:
      throw new Error("No action found.");
  }
}

interface AddTerminalEquipmentProps {
  routeNodeId: string;
  rackId?: string;
}

function AddTerminalEquipment({
  routeNodeId,
  rackId,
}: AddTerminalEquipmentProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();
  const client = useClient();

  const [specificationResponse] = useQuery<SpanEquipmentSpecificationsResponse>(
    {
      query: QUERY_TERMINAL_EQUIPMENT,
    }
  );

  const [nearestAddressesResponse] = useQuery<NearestAccessAddressesResponse>({
    query: NEAREST_ACCESS_ADDRESSES_QUERY,
    variables: { routeNodeId: routeNodeId },
  });

  console.log(nearestAddressesResponse);

  const [rackResponse] = useQuery<RackResponse>({
    query: QUERY_RACK,
    variables: { routeNodeId: routeNodeId, rackId: rackId },
    pause: !routeNodeId || !rackId,
  });

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (
      !specificationResponse.data?.utilityNetwork
        .terminalEquipmentSpecifications
    )
      return [];
    return categoryToOptions(
      specificationResponse.data.utilityNetwork.terminalEquipmentSpecifications,
      !!rackId
    );
  }, [
    specificationResponse.data?.utilityNetwork.terminalEquipmentSpecifications,
    rackId,
  ]);

  const specificationOptions = useMemo<SelectOption[]>(() => {
    if (
      !specificationResponse.data?.utilityNetwork
        .terminalEquipmentSpecifications ||
      !state.category
    )
      return [];
    return specificationToOptions(
      specificationResponse.data.utilityNetwork.terminalEquipmentSpecifications,
      state.category,
      !!rackId
    );
  }, [
    specificationResponse.data?.utilityNetwork.terminalEquipmentSpecifications,
    state.category,
    rackId,
  ]);

  const manufacturerOptions = useMemo<SelectOption[]>(() => {
    if (
      !specificationResponse.data?.utilityNetwork
        .terminalEquipmentSpecifications ||
      !state.specification
    )
      return [];
    return manufacturerToOptions(
      specificationResponse.data.utilityNetwork.manufacturers,
      specificationResponse.data.utilityNetwork.terminalEquipmentSpecifications.find(
        (x) => x.id === state.specification
      )?.manufacturerRefs ?? []
    );
  }, [state.specification, specificationResponse]);

  const accessAddresses = useMemo<SelectOption[]>(() => {
    if (!nearestAddressesResponse.data?.addressService.nearestAccessAddresses)
      return [];

    const defaultList: SelectOption[] = [
      {
        text: t("SELECT_ACCESS_ADDRESS"),
        value: "",
        key: "SELECT_ACCESS_ADDRESS",
      },
    ];

    const options =
      nearestAddressesResponse.data?.addressService.nearestAccessAddresses
        .sort((x, y) => x.distance - y.distance)
        .map((x) => accessAddressToOption(x, t));

    // We do this because there is an issue
    // where unit address has an id but no labels and its the only one
    if (options.length === 1) {
      return [
        {
          text: t("SELECT_ACCESS_ADDRESS"),
          value: options[0].value,
          key: "SELECT_ACCESS_ADDRESS",
        },
      ];
    }

    return defaultList.concat(options);
  }, [nearestAddressesResponse, t]);

  const unitAddressOptions = useMemo<SelectOption[]>(() => {
    if (!nearestAddressesResponse.data?.addressService.nearestAccessAddresses)
      return [];

    const defaultList: SelectOption[] = [
      {
        text: t("SELECT_UNIT_ADDRESS"),
        value: "",
        key: "SELECT_UNIT_ADDRESS",
      },
    ];

    const options =
      nearestAddressesResponse.data?.addressService.nearestAccessAddresses
        .find((x) => x.accessAddress.id === state.accessAddressId)
        ?.accessAddress.unitAddresses.sort((x, y) =>
          x.externalId > y.externalId ? 1 : -1
        )
        .map(unitAddressToOption) ?? [];

    return defaultList.concat(options);
  }, [nearestAddressesResponse, state.accessAddressId, t]);

  const isAddressable = useMemo<boolean>(() => {
    return (
      specificationResponse.data?.utilityNetwork.terminalEquipmentSpecifications.find(
        (x) => x.id === state.specification
      )?.isAddressable ?? false
    );
  }, [state.specification, specificationResponse]);

  useEffect(() => {
    if (!categoryOptions || categoryOptions.length === 0) return;
    dispatch({ type: "setCategory", id: categoryOptions[0].value as string });
  }, [categoryOptions]);

  const addTerminalEquipment = async () => {
    const params: PlaceTerminalEquipmentInNodeContainerParams = {
      routeNodeId: routeNodeId,
      terminalEquipmentSpecificationId: state.specification,
      namingInfo: { name: state.name },
      numberOfEquipments: state.count,
      startSequenceNumber: state.startNumber,
      terminalEquipmentNamingMethod: state.namingMethod,
      subrackPlacementInfo: rackId
        ? {
            placementMethod: state.placementMethod,
            rackId: rackId,
            startUnitPosition: state.startUnitPosition,
          }
        : null,
    };

    const response = await client
      .mutation<PlaceTerminalEquipmentInNodeContainerResponse>(
        PLACE_TERMINAL_EQUIPMENT_IN_NODE_CONTAINER,
        params
      )
      .toPromise();

    if (
      !response.data?.nodeContainer?.placeTerminalEquipmentInNodeContainer
        ?.isSuccess
    ) {
      toast.error(
        t(
          response.data?.nodeContainer.placeTerminalEquipmentInNodeContainer
            .errorCode ?? "ERROR"
        )
      );
    } else {
      dispatch({ type: "reset" });
    }
  };

  return (
    <div className="add-terminal-equipment">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text={`${t("CATEGORY")}:`}>
            <SelectMenu
              autoSelectFirst={true}
              options={categoryOptions}
              removePlaceHolderOnSelect
              onSelected={(x) =>
                dispatch({ type: "setCategory", id: x as string })
              }
              selected={state.category}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("SPECIFICATION")}:`}>
            <SelectMenu
              autoSelectFirst={true}
              options={specificationOptions}
              removePlaceHolderOnSelect
              onSelected={(x) =>
                dispatch({ type: "setSpecification", id: x as string })
              }
              selected={state.specification}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("MANUFACTURER")}:`}>
            <SelectMenu
              autoSelectFirst={true}
              options={manufacturerOptions}
              removePlaceHolderOnSelect
              onSelected={(x) =>
                dispatch({ type: "setManufacturer", id: x as string })
              }
              selected={state.manufacturer}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("NAME")}:`}>
            <TextBox
              value={state.name}
              setValue={(x) => dispatch({ type: "setName", text: x })}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("COUNT")}:`}>
            <NumberPicker
              value={state.count}
              setValue={(x) => dispatch({ type: "setCount", count: x })}
              minValue={0}
              maxValue={100}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("START_NUMBER")}:`}>
            <NumberPicker
              value={state.startNumber}
              minValue={0}
              maxValue={100}
              setValue={(x) =>
                dispatch({ type: "setStartNumber", startNumber: x })
              }
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("LABEL_METHOD")}:`}>
            <SelectMenu
              options={[
                {
                  text: t("NAME_AND_NUMBER"),
                  value: "NAME_AND_NUMBER",
                  key: 0,
                },
                { text: t("NAME_ONLY"), value: "NAME_ONLY", key: 1 },
                { text: t("NUMBER_ONLY"), value: "NUMBER_ONLY", key: 2 },
              ]}
              removePlaceHolderOnSelect
              onSelected={(x) =>
                dispatch({
                  type: "setNamingMethod",
                  method: x as NamingMethod,
                })
              }
              selected={state.namingMethod}
            />
          </LabelContainer>
        </div>
      </div>
      {rackId && (
        <div className="full-row-group">
          <p className="full-row-group__title">
            {rackResponse.data?.utilityNetwork.rack.name}
          </p>
          <div className="full-row">
            <LabelContainer text={`${t("RACK_UNIT")}:`}>
              <NumberPicker
                value={state.startUnitPosition}
                minValue={0}
                maxValue={100}
                setValue={(x) =>
                  dispatch({ type: "setStartUnitPosition", unitPosition: x })
                }
              />
            </LabelContainer>
          </div>
          <div className="full-row">
            <LabelContainer text={`${t("PLACEMENT_METHOD")}:`}>
              <SelectMenu
                options={[
                  { text: t("TOP_DOWN"), value: "TOP_DOWN", key: 0 },
                  { text: t("BOTTOM_UP"), value: "BOTTOM_UP", key: 1 },
                ]}
                removePlaceHolderOnSelect
                onSelected={(x) =>
                  dispatch({
                    type: "setPlacementMethod",
                    method: x as PlacementMethod,
                  })
                }
                selected={state.placementMethod}
              />
            </LabelContainer>
          </div>
        </div>
      )}

      {isAddressable && (
        <div className="block">
          <p className="block-title">{t("ADDRESS_INFORMATION")}</p>
          <div className="full-row">
            <SelectMenu
              options={accessAddresses ?? []}
              onSelected={(x) =>
                dispatch({
                  type: "setAccessAddressId",
                  id: x?.toString() ?? "",
                })
              }
              selected={state.accessAddressId}
              enableSearch={true}
            />
          </div>
          <div className="full-row">
            <SelectMenu
              options={unitAddressOptions ?? []}
              onSelected={(x) =>
                dispatch({ type: "setUnitAddressId", id: x?.toString() ?? "" })
              }
              selected={state.unitAddressId}
              enableSearch={true}
            />
          </div>
          <div className="full-row">
            <TextBox
              placeHolder={t("ADDITIONAL_ADDRESS_INFORMATION")}
              setValue={(x) =>
                dispatch({ type: "setAdditionalAddressInformation", text: x })
              }
              value={state.addtionalAddressInformation}
            />
          </div>
        </div>
      )}

      <div className="full-row">
        <DefaultButton
          disabled={state.count === 0 || !state.startNumber}
          innerText={t("ADD")}
          onClick={() => addTerminalEquipment()}
        />
      </div>
    </div>
  );
}

export default AddTerminalEquipment;
