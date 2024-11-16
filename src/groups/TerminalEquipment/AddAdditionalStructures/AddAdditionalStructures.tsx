import { useState } from "react";
import { useTranslation } from "react-i18next";
import AddCard from "./AddCard";
import AddInterface from "./AddInterface";
import TabView from "../../../components/TabView";

interface AddAdditionalStructuresProps {
  routeNodeId: string;
  terminalEquipmentId: string;
  addedSuccessCallback?: () => void;
}

function AddAdditionalStructures({
  routeNodeId,
  terminalEquipmentId,
  addedSuccessCallback,
}: AddAdditionalStructuresProps) {
  const { t } = useTranslation();
  const [tabViewSelectedId, setTabViewSelectedId] = useState("0");

  return (
    <TabView
      select={setTabViewSelectedId}
      key="0"
      selectedId={tabViewSelectedId}
      showFullScreenButton={false}
      views={[
        {
          title: t("ADD_CARD"),
          id: "0",
          view: (
            <AddCard
              routeNodeId={routeNodeId}
              terminalEquipmentId={terminalEquipmentId}
              addedSuccessCallback={addedSuccessCallback}
            />
          ),
        },
        {
          title: t("ADD_INTERFACE"),
          id: "1",
          view: <AddInterface />,
        },
      ]}
    />
  );
}

export default AddAdditionalStructures;
