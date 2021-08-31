import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const connectionTypeOptions: SelectOption[] = [
  { text: "CUSTOMER_CONDUIT_END", value: "CONNECTION_END", key: 0 },
];

const connectionPointOptions: SelectOption[] = [
  { text: "Skab F3420", value: "1", key: 0 },
  { text: "Skab F3425", value: "2", key: 0 },
  { text: "Skab F3430", value: "3", key: 0 },
  { text: "Skab F3435", value: "4", key: 0 },
  { text: "Skab F3440", value: "5", key: 0 },
];

function EstablishCustomerConnection() {
  const { t } = useTranslation();
  const [selectedConnectionType, setSelectedConnectionType] =
    useState("CONNECTION_END");
  const [selectedConnectionPoint, setSelectedConnectionPoint] = useState("1");

  return (
    <div className="establish-customer-connection page-container">
      <div className="full-row">
        <SelectMenu
          options={connectionTypeOptions}
          onSelected={(x) => setSelectedConnectionType(x?.toString() ?? "")}
          selected={selectedConnectionType}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={connectionPointOptions}
          onSelected={(x) => setSelectedConnectionPoint(x?.toString() ?? "")}
          selected={selectedConnectionPoint}
        />
      </div>
      <div className="full-row">
        <DefaultButton innerText={t("PERFORM")} onClick={() => {}} />
      </div>
    </div>
  );
}

export default EstablishCustomerConnection;
