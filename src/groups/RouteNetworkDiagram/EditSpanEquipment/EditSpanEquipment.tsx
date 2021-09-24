import { useMemo, useState, useEffect } from "react";
import {
  Manufacturer,
  QUERY_SPAN_EQUIPMENT_DETAILS,
  QUERY_SPAN_EQUIPMENT_SPECIFICATIONS_MANUFACTURER,
  SpanEquipmentDetailsResponse,
  SpanEquipmentSpecification,
  SpanEquipmentSpecificationsResponse,
  MUTATION_UPDATE_SPAN_EQUIPMENT_DETAILS,
  UpdateSpanEquipmentDetailsParameters,
  UpdateSpanEquipmentDetailsResponse,
  NEAREST_ACCESS_ADDRESSES_QUERY,
  NearestAccessAddress,
  NearestAccessAddressesResponse,
  UnitAddress,
} from "./EditspanEquipmentGql";
import { useQuery, useClient } from "urql";
import { TFunction, useTranslation } from "react-i18next";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import SelectListView, { BodyItem } from "../../../components/SelectListView";
import { toast } from "react-toastify";
import Config from "../../../config";

type EditSpanEquipmentParams = {
  spanEquipmentMrid: string;
};

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

const getFilteredSpanEquipmentSpecifications = (
  specifications: SpanEquipmentSpecification[],
  selectedCategory: string | number | undefined
) => {
  const bodyItems = specifications.map<BodyItem>((x) => {
    return {
      rows: [{ id: 0, value: x.description }],
      id: x.id,
    };
  });

  return bodyItems.filter((x) => {
    return (
      specifications.find((y) => {
        return y.id === x.id;
      })?.category === selectedCategory
    );
  });
};

const getFilteredManufacturers = (
  manufacturers: Manufacturer[],
  selectedSpanEquipmentSpecification: string | number | undefined,
  spanEquipmentSpecifications: SpanEquipmentSpecification[],
  t: TFunction<"translation">
) => {
  if (
    !manufacturers ||
    manufacturers.length === 0 ||
    !selectedSpanEquipmentSpecification
  ) {
    return [];
  }

  const bodyItems = manufacturers.map<BodyItem>((x) => {
    return {
      rows: [{ id: 0, value: x.name }],
      id: x.id,
    };
  });

  const spanEquipment = spanEquipmentSpecifications.find(
    (x) => x.id === selectedSpanEquipmentSpecification
  );
  if (!spanEquipment) {
    throw new Error(
      `Could not find SpanEquipment on id ${selectedSpanEquipmentSpecification}`
    );
  }

  const filtered = bodyItems.filter((x) => {
    return spanEquipment.manufacturerRefs.includes(x.id.toString());
  });

  const defaultValue = {
    rows: [{ id: 0, value: t("Unspecified") }],
    id: "",
  };

  return [defaultValue, ...filtered];
};

const colorOptions = (colors: string[], t: TFunction<"translation">) => {
  const options = colors.map<SelectOption>((x) => {
    return { text: x, value: x };
  });

  return [{ text: t("Pick color marking"), value: "" }, ...options];
};

function EditSpanEquipment({ spanEquipmentMrid }: EditSpanEquipmentParams) {
  const { t } = useTranslation();
  const client = useClient();
  const [colorMarkingOptions] = useState<SelectOption[]>(
    colorOptions(Config.COLOR_OPTIONS, t)
  );
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [
    spanEquipmentSpecifications,
    setSpanEquipmentssetSpanEquipmentSpecifications,
  ] = useState<SpanEquipmentSpecification[]>([]);
  const [
    selectedSpanEquipmentSpecification,
    setSelectedSpanEquipmentSpecification,
  ] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<
    string | number | undefined
  >();
  const [selectedColorMarking, setSelectedColorMarking] = useState<
    string | number | undefined
  >("");
  const [selectedAccessAddressId, setSelectedAccessAddressId] =
    useState<string>("");
  const [selectedUnitAddressId, setSelectedUnitAddressId] =
    useState<string>("");
  const [additionalAddressInformation, setAdditionalAddressInformation] =
    useState<string>("");

  const [spanEquipmentDetailsResponse] = useQuery<SpanEquipmentDetailsResponse>(
    {
      query: QUERY_SPAN_EQUIPMENT_DETAILS,
      variables: { spanEquipmentOrSegmentId: spanEquipmentMrid },
      pause: !spanEquipmentMrid,
    }
  );

  const [spanEquipmentSpecificationsResponse] =
    useQuery<SpanEquipmentSpecificationsResponse>({
      query: QUERY_SPAN_EQUIPMENT_SPECIFICATIONS_MANUFACTURER,
      requestPolicy: "cache-and-network",
      pause: !spanEquipmentMrid,
    });

  const [nearestAccessAddressesResponse] =
    useQuery<NearestAccessAddressesResponse>({
      query: NEAREST_ACCESS_ADDRESSES_QUERY,
      requestPolicy: "network-only",
      variables: { spanEquipmentOrSegmentId: spanEquipmentMrid },
      pause: !spanEquipmentMrid,
    });

  const filteredSpanEquipmentSpecifications = useMemo(
    () =>
      getFilteredSpanEquipmentSpecifications(
        spanEquipmentSpecifications,
        selectedCategory
      ),
    [spanEquipmentSpecifications, selectedCategory]
  );

  const filteredManufactuers = useMemo(
    () =>
      getFilteredManufacturers(
        manufacturers,
        selectedSpanEquipmentSpecification,
        spanEquipmentSpecifications,
        t
      ),
    [
      manufacturers,
      selectedSpanEquipmentSpecification,
      spanEquipmentSpecifications,
      t,
    ]
  );

  const accessAddresses = useMemo<SelectOption[]>(() => {
    if (
      !nearestAccessAddressesResponse.data?.addressService
        .nearestAccessAddresses
    )
      return [];

    const defaultList: SelectOption[] = [
      {
        text: t("SELECT_ACCESS_ADDRESS"),
        value: "",
        key: "SELECT_ACCESS_ADDRESS",
      },
    ];

    const options =
      nearestAccessAddressesResponse.data?.addressService.nearestAccessAddresses
        .sort((x, y) => x.distance - y.distance)
        .map((x) => accessAddressToOption(x, t));

    return defaultList.concat(options);
  }, [nearestAccessAddressesResponse, t]);

  const unitAddressOptions = useMemo<SelectOption[]>(() => {
    if (
      !nearestAccessAddressesResponse.data?.addressService
        .nearestAccessAddresses
    )
      return [];

    const defaultList: SelectOption[] = [
      {
        text: t("SELECT_UNIT_ADDRESS"),
        value: "",
        key: "-1",
      },
    ];

    const options =
      nearestAccessAddressesResponse.data?.addressService.nearestAccessAddresses
        .find((x) => x.accessAddress.id === selectedAccessAddressId)
        ?.accessAddress.unitAddresses.sort((x, y) =>
          x.externalId > y.externalId ? 1 : -1
        )
        .map(unitAddressToOption) ?? [];

    // We do this because there is an issue
    // where unit address has an id but no labels and its the only one
    if (options.length === 1) {
      return [
        {
          text: t("SELECT_UNIT_ADDRESS"),
          value: options[0].value,
          key: "-1",
        },
      ];
    }

    return defaultList.concat(options);
  }, [nearestAccessAddressesResponse, selectedAccessAddressId, t]);

  useEffect(() => {
    if (!spanEquipmentSpecificationsResponse.data) return;

    const { spanEquipmentSpecifications, manufacturers } =
      spanEquipmentSpecificationsResponse.data.utilityNetwork;

    if (!spanEquipmentSpecifications || !manufacturers) return;

    setManufacturers(manufacturers);
    setSpanEquipmentssetSpanEquipmentSpecifications(
      spanEquipmentSpecifications
    );
  }, [spanEquipmentSpecificationsResponse]);

  useEffect(() => {
    if (!spanEquipmentDetailsResponse.data) return;

    const { manufacturer, markingInfo, specification } =
      spanEquipmentDetailsResponse.data.utilityNetwork.spanEquipment;

    setSelectedCategory(specification.category);
    setSelectedSpanEquipmentSpecification(specification.id);
    setSelectedManufacturer(manufacturer?.id ?? "");
    setSelectedColorMarking(markingInfo?.markingColor ?? "");
    setSelectedAccessAddressId(
      spanEquipmentDetailsResponse.data.utilityNetwork?.spanEquipment
        ?.addressInfo?.accessAddress?.id ?? ""
    );
    setSelectedUnitAddressId(
      spanEquipmentDetailsResponse.data?.utilityNetwork?.spanEquipment
        ?.addressInfo?.unitAddress?.id ?? ""
    );
    setAdditionalAddressInformation(
      spanEquipmentDetailsResponse.data?.utilityNetwork?.spanEquipment
        ?.addressInfo?.remark ?? ""
    );
  }, [spanEquipmentDetailsResponse]);

  useEffect(() => {
    if (unitAddressOptions.length === 1)
      setSelectedUnitAddressId(unitAddressOptions[0].value.toString());
  }, [unitAddressOptions, setSelectedUnitAddressId]);

  const selectSpanEquipmentSpecification = (specificationId: string) => {
    if (selectedSpanEquipmentSpecification === specificationId) return;

    setSelectedSpanEquipmentSpecification(specificationId);
    setSelectedManufacturer("");
  };

  const update = async () => {
    if (!selectedSpanEquipmentSpecification) {
      toast.error("ERROR");
      return;
    }

    const params: UpdateSpanEquipmentDetailsParameters = {
      spanEquipmentOrSegmentId: spanEquipmentMrid,
      manufacturerId:
        selectedManufacturer === ""
          ? "00000000-0000-0000-0000-000000000000"
          : selectedManufacturer,
      markingColor: selectedColorMarking?.toString() ?? "",
      spanEquipmentSpecificationId: selectedSpanEquipmentSpecification,
      accessAddressId: selectedAccessAddressId ? selectedAccessAddressId : null,
      unitAddressId: selectedUnitAddressId ? selectedUnitAddressId : null,
      remark: additionalAddressInformation
        ? additionalAddressInformation
        : null,
    };

    const result = await client
      .mutation<UpdateSpanEquipmentDetailsResponse>(
        MUTATION_UPDATE_SPAN_EQUIPMENT_DETAILS,
        params
      )
      .toPromise();

    if (result.data?.spanEquipment.updateProperties.isSuccess) {
      toast.success(t("UPDATED"));
    } else {
      toast.error(
        t(result.data?.spanEquipment.updateProperties.errorCode ?? "ERROR")
      );
    }
  };

  const selectAccessAddressId = (id: string) => {
    setSelectedAccessAddressId(id);
    setSelectedUnitAddressId("");
  };

  return (
    <div className="edit-span-equipment page-container">
      <div className="block">
        <p className="block-title">{t("SPAN_EQUIPMENT_INFORMATION")}</p>
        <div className="full-row">
          <SelectListView
            headerItems={[t("Specification")]}
            bodyItems={filteredSpanEquipmentSpecifications}
            selectItem={(x) =>
              selectSpanEquipmentSpecification(x.id.toString())
            }
            selected={selectedSpanEquipmentSpecification}
            maxHeightBody="175px"
          />
        </div>
        <div className="full-row">
          <SelectListView
            headerItems={[t("Manufacturer")]}
            bodyItems={filteredManufactuers}
            selectItem={(x) => setSelectedManufacturer(x.id.toString())}
            selected={selectedManufacturer}
            maxHeightBody="175px"
          />
        </div>
        <div className="full-row">
          <SelectMenu
            options={colorMarkingOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setSelectedColorMarking(x)}
            selected={selectedColorMarking}
            enableSearch={true}
          />
        </div>
      </div>

      <div className="block">
        <p className="block-title">{t("ADDRESS_INFORMATION")}</p>
        <div className="full-row">
          <SelectMenu
            options={accessAddresses ?? []}
            onSelected={(x) => selectAccessAddressId(x?.toString() ?? "")}
            selected={selectedAccessAddressId}
            enableSearch={true}
          />
        </div>
        <div className="full-row">
          <SelectMenu
            options={unitAddressOptions ?? []}
            onSelected={(x) => setSelectedUnitAddressId(x?.toString() ?? "")}
            selected={selectedUnitAddressId}
            enableSearch={true}
          />
        </div>
        <div className="full-row">
          <TextBox
            placeHolder={t("ADDITIONAL_ADDRESS_INFORMATION")}
            setValue={setAdditionalAddressInformation}
            value={additionalAddressInformation}
          />
        </div>
      </div>

      <div className="full-row">
        <DefaultButton
          innerText={t("UPDATE")}
          onClick={() => update()}
          disabled={
            selectedColorMarking === undefined ||
            !selectedManufacturer === undefined ||
            !selectedSpanEquipmentSpecification
              ? true
              : false
          }
        />
      </div>
    </div>
  );
}

export default EditSpanEquipment;
