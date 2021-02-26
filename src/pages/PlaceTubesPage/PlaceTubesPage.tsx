import { useEffect, useState } from "react";
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
  const [options] = useState<SelectOption[]>([
    { text: t("Pick color marking"), value: -1, selected: true },
    { text: "Red", value: 1, selected: false },
    { text: "Blue", value: 2, selected: false },
    { text: "Yellow", value: 3, selected: false },
  ]);
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
    if (fetching || !spanEquipmentResult.data) {
      return;
    }

    const {
      spanEquipmentSpecifications,
      manufacturers,
    } = spanEquipmentResult.data.utilityNetwork;

    if (!spanEquipmentsBodyItems || !manufacturers) {
      return;
    }

    setManufacturers(manufacturers);
    setSpanEquipments(spanEquipmentSpecifications);
  }, [spanEquipmentResult]);

  useEffect(() => {
    const bodyItems = manufacturers.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
        selected: false,
      };
    });

    setManufacturerBodyItems(bodyItems);
  }, [manufacturers]);

  useEffect(() => {
    const bodyItems = spanEquipments.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
        selected: false,
      };
    });

    setSpanEquipmentsBodyItems(bodyItems);
  }, [spanEquipments]);

  const placeSpanEquipment = () => {
    retrieveSelected();
  };

  const selectedSpanEquipment = (): BodyItem | undefined => {
    return spanEquipmentsBodyItems.find((x) => x.selected);
  };

  const filteredManufacturers = () => {
    console.log(selectedSpanEquipment());

    return manufacturerBodyItems;
  };

  const selectSpanEquipment = (selectedItem: BodyItem) => {
    const updatedSpanEquipments = spanEquipmentsBodyItems.map<BodyItem>((x) => {
      return { ...x, selected: x.id === selectedItem.id ? true : false };
    });

    setSpanEquipmentsBodyItems(updatedSpanEquipments);
  };

  const selectManufacturer = (selectedItem: BodyItem) => {
    const updatedManufacturers = manufacturerBodyItems.map<BodyItem>((x) => {
      return { ...x, selected: x.id === selectedItem.id ? true : false };
    });

    setManufacturerBodyItems(updatedManufacturers);
  };

  if (fetching) {
    return <Loading />;
  }

  return (
    <div className="page-container">
      <div className="full-row">
        <SelectListView
          headerItems={[t("Product model")]}
          bodyItems={spanEquipmentsBodyItems}
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
          options={options}
          removePlaceHolderOnSelect
          onSelected={() => {}}
        />
        <DefaultButton
          innerText={t("Place conduit")}
          onClick={placeSpanEquipment}
        />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
