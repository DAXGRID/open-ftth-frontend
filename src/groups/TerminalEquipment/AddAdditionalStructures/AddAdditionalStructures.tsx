import { useState } from "react";
import { useTranslation } from "react-i18next";
import AddCard from "./AddCard";
import AddInterface from "./AddInterface";
import TabView from "../../../components/TabView";

interface AddAdditionalStructuresProps {
  routeNodeId: string;
  terminalEquipmentId: string;
  isLineTermination: boolean;
  addedSuccessCallback?: () => void;
}

function AddAdditionalStructures({
  routeNodeId,
  terminalEquipmentId,
  isLineTermination,
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
      views={
        isLineTermination
          ? [
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
                view: (
                  <AddInterface
                    routeNodeId={routeNodeId}
                    terminalEquipmentId={terminalEquipmentId}
                  />
                ),
              },
            ]
          : [
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
            ]
      }
    />
  );
}

export default AddAdditionalStructures;
