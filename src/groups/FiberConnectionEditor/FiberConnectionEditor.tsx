import { useMemo, useState } from "react";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import LabelContainer from "../../components/LabelContainer";
import DefaultButton from "../../components/DefaultButton";
import TextBox from "../../components/TextBox";
import NumberPicker from "../../components/NumberPicker";
import EquipmentSelector from "./EquipmentSelector";
import { useTranslation } from "react-i18next";
import {
  getConnectivityFacesData,
  ConnectivityFace,
  ConnectivityFaceConnection,
  getTConnectivityFaceConnectionsData,
  getSConnectivityFaceConnectionsData,
} from "./FiberConnectionEditorGql";

function createConnectivityFaceSelectOptions(
  x: ConnectivityFace[]
): SelectOption[] {
  return x.map<SelectOption>((y) => {
    return {
      text: `${y.equipmentName} (${y.directionName})`,
      value: `${y.equipmentId}(${y.directionType})`,
      key: `${y.equipmentId}(${y.directionType})`,
    };
  });
}

function createConnectivityFaceConnectionSelectOptions(
  x: ConnectivityFaceConnection[]
): SelectOption[] {
  return x.map<SelectOption>((y) => {
    return {
      text: y.name,
      value: y.id,
      key: y.id,
    };
  });
}

function FiberConnectionEditor() {
  const { t } = useTranslation();
  const [fromEquipmentId, setFromEquipmentId] = useState<string>("");
  const [toEquipmentId, setToEquipmentId] = useState<string>("");
  const [fromPositionId, setFromPositionId] = useState<string>("");
  const [toPositionId, setToPositionId] = useState<string>("");
  const [connectivityData] = useState(getConnectivityFacesData());
  const [tConnectivityFaceConnections] = useState(
    getTConnectivityFaceConnectionsData()
  );
  const [sConnectivityFaceConnections] = useState(
    getSConnectivityFaceConnectionsData()
  );

  const connectivityFaceOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceSelectOptions(
        connectivityData.equipmentConnectivityFaces
      ),
    ];
  }, [connectivityData, t]);

  const tConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceConnectionSelectOptions(
        tConnectivityFaceConnections.connectivityFaceConnections
      ),
    ];
  }, [connectivityData, t]);

  const sConnectivityFaceConnectionOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: t("CHOOSE"), value: "", key: "0" },
      ...createConnectivityFaceConnectionSelectOptions(
        sConnectivityFaceConnections.connectivityFaceConnections
      ),
    ];
  }, [connectivityData, t]);

  return (
    <div className="fiber-connection-editor">
      <div className="full-row">
        <LabelContainer text={t("FROM_EQUIPMENT")}>
          <SelectMenu
            options={connectivityFaceOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setFromEquipmentId(x as string)}
            selected={fromEquipmentId}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_EQUIPMENT")}>
          <SelectMenu
            options={connectivityFaceOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setToEquipmentId(x as string)}
            selected={toEquipmentId}
            enableSearch={true}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text={t("FROM_POSITION")}>
          <SelectMenu
            options={tConnectivityFaceConnectionOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setFromPositionId(x as string)}
            selected={fromPositionId}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_POSITION")}>
          <SelectMenu
            options={sConnectivityFaceConnectionOptions}
            removePlaceHolderOnSelect
            onSelected={(x) => setToPositionId(x as string)}
            selected={toPositionId}
            enableSearch={true}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text={t("NUMBER_OF_CONNECTIONS")}>
          <NumberPicker minWidth="250px" setValue={() => {}} value={0} />
        </LabelContainer>
        <LabelContainer text={t("FROM_EQUIPMENT_JUMP")}>
          <NumberPicker minWidth="250px" setValue={() => {}} value={0} />
        </LabelContainer>
        <LabelContainer text={t("PATCH/PIGTAIL_COORD_LENGTH_CM")}>
          <TextBox minWidth="250px" setValue={() => {}} value="0" />
        </LabelContainer>
      </div>
      <div className="full-row">
        <EquipmentSelector t={t} />
      </div>
      <div className="full-row center-items">
        <DefaultButton
          innerText={t("CONNECT")}
          maxWidth="500px"
          onClick={() => {
            console.log("Clicked");
          }}
        />
      </div>
    </div>
  );
}

export default FiberConnectionEditor;
