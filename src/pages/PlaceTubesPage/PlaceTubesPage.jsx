import React from "react";
import SelectListView from "../../components/SelectListView";
import SelectMenu from "../../components/SelectMenu";
import DefaultButton from "../../components/DefaultButton";
import { useTranslation } from "react-i18next";

function PlaceTubesPage() {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <div className="full-row">
        <SelectListView
          headerItems={[t("Manufacturer"), t("Product model")]}
          bodyItems={[
            ["GM Plast", "Oe50 7x16"],
            ["Plast GM", "Oe40 16x7"],
            ["Plast GM", "Oe50 20x7"],
            ["GM Plast", "Oe70 7x16"],
          ]}
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
        <DefaultButton innerText={t("Place conduit")} />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
