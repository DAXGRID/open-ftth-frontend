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
} from "./EditspanEquipmentGql";
import { useQuery, useClient } from "urql";
import { TFunction, useTranslation } from "react-i18next";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import SelectListView, { BodyItem } from "../../../components/SelectListView";
import { toast } from "react-toastify";
import Config from "../../../config";

type EditSpanEquipmentParams = {
  spanEquipmentMrid: string;
};

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
  t: TFunction<string>
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

const colorOptions = (colors: string[], t: TFunction<string>) => {
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

  const [spanEquipmentDetailsResponse] = useQuery<SpanEquipmentDetailsResponse>(
    {
      query: QUERY_SPAN_EQUIPMENT_DETAILS,
      variables: { spanEquipmentOrSegmentId: spanEquipmentMrid },
      pause: !spanEquipmentMrid,
    }
  );

  const [
    spanEquipmentSpecificationsResponse,
  ] = useQuery<SpanEquipmentSpecificationsResponse>({
    query: QUERY_SPAN_EQUIPMENT_SPECIFICATIONS_MANUFACTURER,
    requestPolicy: "cache-first",
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

  useEffect(() => {
    if (!spanEquipmentSpecificationsResponse.data) {
      return;
    }

    const {
      spanEquipmentSpecifications,
      manufacturers,
    } = spanEquipmentSpecificationsResponse.data.utilityNetwork;

    if (!spanEquipmentSpecifications || !manufacturers) {
      return;
    }

    setManufacturers(manufacturers);
    setSpanEquipmentssetSpanEquipmentSpecifications(
      spanEquipmentSpecifications
    );
  }, [spanEquipmentSpecificationsResponse]);

  useEffect(() => {
    if (!spanEquipmentDetailsResponse.data) {
      return;
    }

    const {
      manufacturer,
      markingInfo,
      specification,
    } = spanEquipmentDetailsResponse.data.utilityNetwork.spanEquipment;

    setSelectedCategory(specification.category);
    setSelectedSpanEquipmentSpecification(specification.id);
    setSelectedManufacturer(manufacturer?.id ?? "");
    setSelectedColorMarking(markingInfo?.markingColor ?? "");
  }, [spanEquipmentDetailsResponse]);

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

  return (
    <div className="edit-span-equipment page-container">
      <div className="full-row">
        <SelectListView
          headerItems={[t("Specification")]}
          bodyItems={filteredSpanEquipmentSpecifications}
          selectItem={(x) => selectSpanEquipmentSpecification(x.id.toString())}
          selected={selectedSpanEquipmentSpecification}
          maxHeightBody="400px"
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Manufacturer")]}
          bodyItems={filteredManufactuers}
          selectItem={(x) => setSelectedManufacturer(x.id.toString())}
          selected={selectedManufacturer}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={colorMarkingOptions}
          removePlaceHolderOnSelect
          onSelected={(x) => setSelectedColorMarking(x)}
          selected={selectedColorMarking}
        />
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
