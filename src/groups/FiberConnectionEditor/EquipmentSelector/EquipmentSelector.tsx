import { TFunction } from "react-i18next";

type EquipmentSelectorProps = {
  t: TFunction;
};

function EquipmentSelector({ t }: EquipmentSelectorProps) {
  return (
    <div className="equipment-selector">
      <div className="equipment-selector-table">
        <div className="equipment-selector-table-header">
          <div className="equipment-selector-table-header__row">
            <p>{t("END_INFO")}:</p>
            <p>{t("FROM_EQUIPMENT")}:</p>
            <p></p>
            <p>{t("TO_EQUIPMENT")}:</p>
            <p>{t("END_INFO")}:</p>
          </div>
        </div>
        <div className="equipment-selector-table-body">
          <div className="equipment-selector-table-body__row">
            <p>Test</p>
            <p>Test</p>
            <p className="text-center">-</p>
            <p>Test</p>
            <p>Test</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquipmentSelector;
