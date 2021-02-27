import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import SelectListView, { BodyItem } from "../../components/SelectListView";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import DefaultButton from "../../components/DefaultButton";
import useBridgeConnector from "../../bridge/useBridgeConnector";
import Loading from "../../components/Loading";
import { useQuery } from "urql";
import {
  UtilityNetworkResponse,
  SPAN_EQUIPMENT_SPEFICIATIONS_MANUFACTURER_QUERY,
  Manufacturer,
  SpanEquipmentSpecification,
} from "./PlaceTubesPageGql";

function PlaceTubesPage() {
  const { t } = useTranslation();
  const { retrieveSelected } = useBridgeConnector();
  const [colorMarkingOptions] = useState<SelectOption[]>([
    { text: t("Pick color marking"), value: -1, selected: true },
    { text: "Red", value: 1, selected: false },
    { text: "Blue", value: 2, selected: false },
    { text: "Yellow", value: 3, selected: false },
  ]);
  const [
    selectedColorMarking,
    setSelectedColorMarking,
  ] = useState<SelectOption>();
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption>();
  const [spanEquipmentsBodyItems, setSpanEquipmentsBodyItems] = useState<
    BodyItem[]
  >([]);
  const [manufacturerBodyItems, setManufacturerBodyItems] = useState<
    BodyItem[]
  >([]);

  const [spanEquipments, setSpanEquipments] = useState<
    SpanEquipmentSpecification[]
  >([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

  const [spanEquipmentResult] = useQuery<UtilityNetworkResponse>({
    query: SPAN_EQUIPMENT_SPEFICIATIONS_MANUFACTURER_QUERY,
  });

  const { fetching } = spanEquipmentResult;

  useEffect(() => {
    const token = PubSub.subscribe(
      "RetrieveSelectedResponse",
      // TODO set type instead of any
      (_msg: string, data: any) => {
        if (data.selectedFeaturesMrid.length === 0) {
          // Error
        } else {
          // Success
        }
      }
    );

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [t]);

  useEffect(() => {
    if (!spanEquipmentResult.data) {
      return;
    }

    const {
      spanEquipmentSpecifications,
      manufacturers,
    } = spanEquipmentResult.data.utilityNetwork;

    if (!spanEquipmentSpecifications || !manufacturers) {
      return;
    }

    setManufacturers(manufacturers);
    setSpanEquipments(spanEquipmentSpecifications);
  }, [spanEquipmentResult]);

  useLayoutEffect(() => {
    const bodyItems = manufacturers.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
        selected: false,
      };
    });

    setManufacturerBodyItems(bodyItems);
  }, [manufacturers]);

  useLayoutEffect(() => {
    const seBodyItems = spanEquipments.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
        selected: false,
      };
    });

    setSpanEquipmentsBodyItems(seBodyItems);

    const categoryOptions = spanEquipments
      .map((x) => {
        return x.category;
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .map<SelectOption>((x, i) => {
        return {
          text: t(x),
          value: x,
          selected: i === 0 ? true : false,
        };
      });

    setCategoryOptions(categoryOptions);
  }, [spanEquipments, t]);

  const placeSpanEquipment = () => {
    retrieveSelected();
  };

  const filteredSpanEquipments = () => {
    return spanEquipmentsBodyItems.filter((x) => {
      return (
        spanEquipments.find((y) => {
          return y.id === x.id;
        })?.category === selectedCategory?.value
      );
    });
  };

  const filteredManufacturers = () => {
    const selectedSpanEquipment = spanEquipmentsBodyItems.find(
      (x) => x.selected
    );
    if (!selectedSpanEquipment) {
      return [];
    }

    const spanEquipment = spanEquipments.find(
      (x) => x.id === selectedSpanEquipment.id
    );
    if (!spanEquipment) {
      throw new Error(
        `Could not find SpanEquipment on id ${selectedSpanEquipment.id}`
      );
    }

    return manufacturerBodyItems.filter((x) => {
      return spanEquipment.manufacturerRefs.includes(x.id.toString());
    });
  };

  const selectSpanEquipment = (selectedItem: BodyItem) => {
    const updatedSpanEquipments = spanEquipmentsBodyItems.map<BodyItem>((x) => {
      return x.id === selectedItem.id
        ? { ...x, selected: true }
        : { ...x, selected: false };
    });

    const resetSelectedManufacturers = manufacturerBodyItems.map<BodyItem>(
      (x) => {
        return { ...x, selected: false };
      }
    );

    setManufacturerBodyItems(resetSelectedManufacturers);
    setSpanEquipmentsBodyItems(updatedSpanEquipments);
  };

  const selectManufacturer = (selectedItem: BodyItem) => {
    const updatedManufacturers = manufacturerBodyItems.map<BodyItem>((x) => {
      return x.id === selectedItem.id
        ? { ...x, selected: true }
        : { ...x, selected: false };
    });

    setManufacturerBodyItems(updatedManufacturers);
  };

  if (fetching) {
    return <Loading />;
  }

  return (
    <div className="page-container">
      <div className="full-row">
        <SelectMenu
          options={categoryOptions}
          removePlaceHolderOnSelect
          onSelected={(x) => {
            setSelectedCategory(x);
          }}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Specification")]}
          bodyItems={filteredSpanEquipments()}
          selectItem={selectSpanEquipment}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Manufacturer")]}
          bodyItems={filteredManufacturers()}
          selectItem={selectManufacturer}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={colorMarkingOptions}
          removePlaceHolderOnSelect
          onSelected={(x) => setSelectedColorMarking(x)}
        />
        <DefaultButton
          innerText={t("Place span equipment")}
          onClick={placeSpanEquipment}
        />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
