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
  const [spanEquipments, setSpanEquipments] = useState<BodyItem[]>([]);
  const [manufacturers, setManufacturer] = useState<BodyItem[]>([]);

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
    if (fetching || !spanEquipmentResult.data) return;

    const {
      spanEquipmentSpecifications,
      manufacturer,
    } = spanEquipmentResult.data.utilityNetwork;

    if (!spanEquipments || !manufacturer) return;

    const spanEquipmentBodyItems = spanEquipmentSpecifications.map<BodyItem>(
      (x) => {
        return {
          rows: [{ id: 0, value: x.name }],
          id: x.id,
          selected: false,
        };
      }
    );

    const manufacturerBodyItems = manufacturer.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
        selected: false,
      };
    });

    setSpanEquipments(spanEquipmentBodyItems);
    setManufacturer(manufacturerBodyItems);
  }, [spanEquipmentResult]);

  const placeSpanEquipment = () => {
    retrieveSelected();
  };

  const filteredManufacturers = () => {
    return manufacturers;
  };

  const selectSpanEquipment = (selectedItem: BodyItem) => {
    const updatedSpanEquipments = spanEquipments.map<BodyItem>((x) => {
      return { ...x, selected: x.id === selectedItem.id ? true : false };
    });

    setSpanEquipments(updatedSpanEquipments);
  };

  if (fetching) {
    return <Loading />;
  }

  return (
    <div className="page-container">
      <div className="full-row">
        <SelectListView
          headerItems={[t("Product model")]}
          bodyItems={spanEquipments}
          selectItem={selectSpanEquipment}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Manufacturer")]}
          bodyItems={filteredManufacturers}
          selectItem={selectSpanEquipment}
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
