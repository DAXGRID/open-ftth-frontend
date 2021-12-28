import { useTranslation } from "react-i18next";

function CableConnectivity() {
  const { t } = useTranslation();

  return (
    <div className="cable-connectivity">
      <div className="cable-connectivity-container">
        <p className="cable-connectivity_title">{t("CABLE")}: 12345678</p>
        <p className="cable-connectivity_title">
          {t("TOTAL_LENGTH")}: 335 meter
        </p>
        <div className="cable-connectivity-row-header">
          <div className="cable-connectivity-row">
            <p>{t("FROM")}</p>
            <p>{t("TO")}</p>
            <p>{t("OUTER_CONDUIT")}</p>
            <p>{t("INNER_CONDUIT")}</p>
            <p>{t("DISTANCE")}</p>
          </div>
        </div>
        <div className="cable-connectivity-row-body">
          <div className="cable-connectivity-row">
            <p>GALARH</p>
            <p>FP 1200</p>
            <p>OE50 7x12 Roed Tape</p>
            <p>Subreor 1 - Blaa</p>
            <p>0</p>
          </div>
          <div className="cable-connectivity-row">
            <p>GALARH</p>
            <p>FP 1200</p>
            <p>OE50 7x12 Roed Tape</p>
            <p>Subreor 1 - Blaa</p>
            <p>0</p>
          </div>
          <div className="cable-connectivity-row">
            <p>GALARH</p>
            <p>FP 1200</p>
            <p>OE50 7x12 Roed Tape</p>
            <p>Subreor 1 - Blaa</p>
            <p>0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CableConnectivity;
