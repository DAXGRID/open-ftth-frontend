import React, { useState } from "react";
import SelectListView from "../../components/SelectListView";
import { useTranslation } from "react-i18next";
import DefaultButton from "../../components/DefaultButton";

function WorkTaskPage() {
  const { t } = useTranslation();
  const [worktasks, setWorkTasks] = useState([
    {
      rows: [
        "GM Plast One",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
      ],
      id: 1,
      selected: false,
    },
    {
      rows: [
        "GM Plast One",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
      ],
      id: 1,
      selected: false,
    },
    {
      rows: [
        "GM Plast One",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
      ],
      id: 1,
      selected: false,
    },
    {
      rows: [
        "GM Plast One",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
      ],
      id: 1,
      selected: false,
    },
    {
      rows: [
        "GM Plast One",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
      ],
      id: 1,
      selected: false,
    },
    {
      rows: [
        "GM Plast One",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
        "Oe50 7x16",
      ],
      id: 1,
      selected: false,
    },
  ]);

  const selectItem = (selectedItem) => {
    conduits.forEach((x) => (x.selected = false));
    selectedItem.selected = true;
    setConduits([...conduits]);
  };

  return (
    <div>
      <div className="full-row">
        <SelectListView
          headerItems={[
            t("Installation Id"),
            t("Central office area"),
            t("Flex point area"),
            t("Splice point area"),
            t("Technology"),
            t("Work task type"),
            t("Address"),
            t("Status"),
          ]}
          bodyItems={worktasks}
          selectItem={selectItem}
        />
      </div>

      <div className="full-row">
        <DefaultButton
          maxWidth="400px"
          innerText={t("Pan/Zoom to address")}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

export default WorkTaskPage;
