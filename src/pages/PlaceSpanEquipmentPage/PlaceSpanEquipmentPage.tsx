import { useContext, useLayoutEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { v4 as uuidv4 } from "uuid";
import SelectListView, { BodyItem } from "../../components/SelectListView";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import DefaultButton from "../../components/DefaultButton";
import TextBox from "../../components/TextBox";
import Loading from "../../components/Loading";
import { useQuery, useMutation } from "urql";
import {
  UtilityNetworkResponse,
  SPAN_EQUIPMENT_SPEFICIATIONS_MANUFACTURER_QUERY,
  Manufacturer,
  SpanEquipmentSpecification,
  PlaceSpanEquipmentParameters,
  PLACE_SPAN_EQUIPMENT_IN_ROUTE_NETWORK,
  PlaceSpanEquipmentResponse,
} from "./PlaceSpanEquipmentGql";
import { MapContext } from "../../contexts/MapContext";
import { toast } from "react-toastify";
import Config from "../../config";

const getFilteredSpanEquipmentSpecifications = (
  specifications: SpanEquipmentSpecification[],
  selectedCategory: string | number | undefined,
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
  t: TFunction<string>,
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
    (x) => x.id === selectedSpanEquipmentSpecification,
  );
  if (!spanEquipment) {
    throw new Error(
      `Could not find SpanEquipment on id ${selectedSpanEquipmentSpecification}`,
    );
  }

  const filtered = bodyItems.filter((x) => {
    return spanEquipment.manufacturerRefs.includes(x.id.toString());
  });

  const defaultValue = {
    rows: [{ id: 0, value: t("UNSPECIFIED") }],
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

function PlaceSpanEquipmentPage() {
  const { t } = useTranslation();
  const { selectedSegmentIds } = useContext(MapContext);
  const [colorMarkingOptions] = useState<SelectOption[]>(
    colorOptions(Config.COLOR_OPTIONS, t),
  );

  const [selectedColorMarking, setSelectedColorMarking] = useState<
    string | number | undefined
  >("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | number | undefined
  >();

  const [
    spanEquipmentSpecifications,
    setSpanEquipmentssetSpanEquipmentSpecifications,
  ] = useState<SpanEquipmentSpecification[]>([]);

  const [
    selectedSpanEquipmentSpecification,
    setSelectedSpanEquipmentSpecification,
  ] = useState<string>();

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [markingText, setMarkingText] = useState<string>("");

  const [spanEquipmentResult] = useQuery<UtilityNetworkResponse>({
    query: SPAN_EQUIPMENT_SPEFICIATIONS_MANUFACTURER_QUERY,
  });

  const filteredSpanEquipmentSpecifications = useMemo(
    () =>
      getFilteredSpanEquipmentSpecifications(
        spanEquipmentSpecifications,
        selectedCategory,
      ),
    [spanEquipmentSpecifications, selectedCategory],
  );

  const filteredManufactuers = useMemo(
    () =>
      getFilteredManufacturers(
        manufacturers,
        selectedSpanEquipmentSpecification,
        spanEquipmentSpecifications,
        t,
      ),
    [
      manufacturers,
      selectedSpanEquipmentSpecification,
      spanEquipmentSpecifications,
      t,
    ],
  );

  const [, placeSpanEquipmentMutation] =
    useMutation<PlaceSpanEquipmentResponse>(
      PLACE_SPAN_EQUIPMENT_IN_ROUTE_NETWORK,
    );

  const placeSpanEquipment = async () => {
    const parameters: PlaceSpanEquipmentParameters = {
      spanEquipmentId: uuidv4(),
      spanEquipmentSpecificationId:
        selectedSpanEquipmentSpecification as string,
      routeSegmentIds: selectedSegmentIds,
      manufacturerId: selectedManufacturer ? selectedManufacturer : undefined,
      markingColor: selectedColorMarking
        ? (selectedColorMarking as string)
        : undefined,
      markingText: markingText,
      description: description,
    };

    const { data } = await placeSpanEquipmentMutation(parameters);

    if (data?.spanEquipment.placeSpanEquipmentInRouteNetwork.isSuccess) {
      toast.success(t("Span equipment placed"));
    } else {
      toast.error(
        data?.spanEquipment.placeSpanEquipmentInRouteNetwork.errorCode,
      );
    }
  };

  useLayoutEffect(() => {
    if (!spanEquipmentResult.data) {
      return;
    }

    const { spanEquipmentSpecifications, manufacturers } =
      spanEquipmentResult.data.utilityNetwork;

    if (!spanEquipmentSpecifications || !manufacturers) {
      return;
    }

    setManufacturers(manufacturers);
    setSpanEquipmentssetSpanEquipmentSpecifications(
      spanEquipmentSpecifications,
    );
  }, [spanEquipmentResult]);

  const categorySelectOptions = () => {
    const categoryOptions = spanEquipmentSpecifications
      .map((x) => {
        return x.category;
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .map<SelectOption>((x) => {
        return {
          text: t(x),
          value: x,
        };
      });

    // If none is selected then select Conduit
    if (categoryOptions.length > 0 && !selectedCategory) {
      setSelectedCategory("Conduit");
    }

    return categoryOptions;
  };

  const selectCategory = (categoryId: string | number | undefined) => {
    if (selectedCategory === categoryId || selectCategory === undefined) return;

    setSelectedCategory(categoryId);
    setSelectedSpanEquipmentSpecification(undefined);
    setSelectedManufacturer("");
  };

  const selectSpanEquipmentSpecification = (specificationId: string) => {
    if (selectedSpanEquipmentSpecification === specificationId) return;

    setSelectedSpanEquipmentSpecification(specificationId);
    setSelectedManufacturer("");
  };

  if (spanEquipmentResult.fetching) {
    return <Loading />;
  }

  return (
    <div className="place-span-equipment page-container page-container-fitted container-medium-size">
      <div className="block">
        <p className="block-title">{t("SPAN_EQUIPMENT_INFORMATION")}</p>
        <div className="full-row">
          <SelectMenu
            options={categorySelectOptions()}
            removePlaceHolderOnSelect
            onSelected={selectCategory}
            selected={selectedCategory}
          />
        </div>
        <div className="full-row">
          <SelectListView
            headerItems={[t("Specification")]}
            bodyItems={filteredSpanEquipmentSpecifications}
            selectItem={(x) =>
              selectSpanEquipmentSpecification(x.id.toString())
            }
            selected={selectedSpanEquipmentSpecification}
            maxHeightBody="150px"
          />
        </div>
        <div className="full-row">
          <SelectListView
            headerItems={[t("Manufacturer")]}
            bodyItems={filteredManufactuers}
            selectItem={(x) => setSelectedManufacturer(x.id.toString())}
            selected={selectedManufacturer}
            maxHeightBody="150px"
          />
        </div>
        <div className="full-row">
          <TextBox
            placeHolder={t("COMMENT")}
            setValue={setDescription}
            value={description}
          />
        </div>
      </div>

      <div className="block">
        <p className="block-title">{t("MARKING_INFORMATION")}</p>
        <div className="full-row">
          <SelectMenu
            options={colorMarkingOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setSelectedColorMarking(x)}
            selected={selectedColorMarking}
            enableSearch={true}
          />
        </div>
        <div className="full-row">
          <TextBox
            placeHolder={t("MARKING_TEXT")}
            setValue={setMarkingText}
            value={markingText}
          />
        </div>
      </div>

      <div className="full-row">
        <DefaultButton
          innerText={t("Place span equipment")}
          onClick={() => placeSpanEquipment()}
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

export default PlaceSpanEquipmentPage;
