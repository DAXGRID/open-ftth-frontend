import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import SelectListView from "../../components/SelectListView";
import SelectMenu from "../../components/SelectMenu";
import DefaultButton from "../../components/DefaultButton";
import Notification from "../../components/Notification";
import useBridgeConnector from "../../bridge/useBridgeConnector";

function PlaceTubesPage() {
  const { t } = useTranslation();
  const { retrieveSelected } = useBridgeConnector();
  const [validation, setValidation] = useState({});
  const [conduits, setConduits] = useState([
    {
      rows: [
        { id: 0, value: "Emtelle" },
        { id: 1, value: "ø40 tomrør" },
      ],
      id: 1,
      selected: false,
    },
    {
      rows: [
        { id: 0, value: "Emtelle" },
        { id: 1, value: "ø50 tomrør" },
      ],
      id: 2,
      selected: false,
    },
    {
      rows: [
        { id: 0, value: "Emtelle" },
        { id: 1, value: "ø110 tomrør" },
      ],
      id: 3,
      selected: false,
    },
    {
      rows: [
        { id: 0, value: "Emtelle" },
        { id: 1, value: "ø40 tomrør" },
      ],
      id: 4,
      selected: false,
    },
    {
      rows: [
        { id: 0, value: "Emtelle" },
        { id: 1, value: "ø50 10x10/8" },
      ],
      id: 5,
      selected: false,
    },
  ]);

  useEffect(() => {
    const token = PubSub.subscribe(
      "RetrieveSelectedResponse",
      (_msg: string, data: any) => {
        if (data.selectedFeaturesMrid.length === 0) {
          setValidation({
            type: "error",
            headerText: t("Error"),
            bodyText: t("No segments selected"),
          });
        } else {
          setValidation({
            type: "success",
            headerText: t("Success"),
            bodyText: t("Conduit(s) are now placed"),
          });
        }
      }
    );

    return () => {
      PubSub.unsubscribe(token);
    };
  }, []);

  const placeConduit = () => {
    retrieveSelected();
  };

  const selectItem = (selectedItem: any) => {
    const uConduits = conduits.map((x) => {
      const conduit = { ...x, selected: false };
      return conduit;
    });

    const item = uConduits.find((x) => x.id === selectedItem.id);
    item.selected = true;

    setConduits(uConduits);
  };

  return (
    <div className="page-container">
      <div className="full-row">
        <Notification
          type={validation.type}
          headerText={validation.headerText}
          bodyText={validation.bodyText}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Manufacturer"), t("Product model")]}
          bodyItems={conduits}
          selectItem={selectItem}
        />
      </div>

      <div className="full-row">
        <SelectMenu
          options={[
            { text: t("Pick color marking"), value: -1, selected: true },
            { text: "Red", value: 1, selected: false },
            { text: "Blue", value: 2, selected: false },
            { text: "Yellow", value: 3, selected: false },
          ]}
          removePlaceHolderOnSelect
        />
        <DefaultButton innerText={t("Place conduit")} onClick={placeConduit} />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
