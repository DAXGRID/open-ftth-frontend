import { TFunction } from "react-i18next";

export type EquipmentSelectorProps = {
  rows: {
    from: {
      id: string;
      name: string;
      endInfo: string;
      isConnected: boolean;
    };
    to: {
      id: string;
      name: string;
      endInfo: string;
      isConnected: boolean;
    };
  }[];
  t: TFunction;
};

function EquipmentSelector({ rows, t }: EquipmentSelectorProps) {
  return (
    <div className="equipment-selector">
      <div className="equipment-selector-table">
        <div className="equipment-selector-table-header">
          <div className="equipment-selector-table-header__row">
            <p>{t("END_INFO")}</p>
            <p>{t("FROM")}</p>
            <p></p>
            <p>{t("TO")}</p>
            <p>{t("END_INFO")}</p>
          </div>
        </div>
        <div className="equipment-selector-table-body">
          {rows.map((x) => {
            return (
              <div
                className={`equipment-selector-table-body__row ${
                  x.from.isConnected ||
                  x.to.isConnected ||
                  x.from.id === x.to.id
                    ? "row-invalid"
                    : ""
                }`}
                key={`${x.from.id}${x.to.id}`}
              >
                <p>{x.from.endInfo}</p>
                <p>{x.from.name}</p>
                <p className="text-center">-</p>
                <p>{x.to.name}</p>
                <p>{x.to.endInfo}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EquipmentSelector;
