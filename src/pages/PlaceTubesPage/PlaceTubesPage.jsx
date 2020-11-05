import React, { useEffect, useState } from "react";
import SelectListView from "../../components/SelectListView";
import SelectMenu from "../../components/SelectMenu";
import DefaultButton from "../../components/DefaultButton";
import Notification from "../../components/Notification";
import { useTranslation } from "react-i18next";
import useBridgeConnector from "../../bridge/UseBridgeConnector";
import PubSub from "pubsub-js";

function PlaceTubesPage() {
  const { t } = useTranslation();
  const [retrieveSelected] = useBridgeConnector();
  const [validation, setValidation] = useState({});
  const [conduits, setConduits] = useState([
    { rows: ["GM Plast One", "Oe50 7x16"], id: 1, selected: false },
    { rows: ["GM Plast Two", "Oe50 7x16"], id: 2, selected: false },
    { rows: ["GM Plast Three", "Oe50 7x16"], id: 3, selected: false },
    { rows: ["GM Plast Four", "Oe50 7x16"], id: 4, selected: false },
  ]);

  useEffect(() => {
    const token = PubSub.subscribe("RetrieveSelectedResponse", (msg, data) => {
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
    });

    return () => {
      PubSub.unsubscribe(token);
    };
  }, []);

  const placeConduit = () => {
    retrieveSelected();
  };

  const selectItem = (selectedItem) => {
    conduits.forEach((x) => (x.selected = false));
    selectedItem.selected = true;
    setConduits([...conduits]);
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
          removePlaceHolderOnSelect={true}
        />
        <DefaultButton innerText={t("Place conduit")} onClick={placeConduit} />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
