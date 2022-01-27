import { useTranslation } from "react-i18next";

function PassageView() {
  const { t } = useTranslation();

  return (
    <div className="passage-view">
      <div className="passage-view-container">
        <p className="passage-view_title">{t("CABLE")}: 12345678</p>
        <p className="passage-view_title">{t("TOTAL_LENGTH")}: 335 meter</p>
        <div className="passage-view-row-header">
          <div className="passage-view-row">
            <p>{t("FROM")}</p>
            <p>{t("TO")}</p>
            <p>{t("OUTER_CONDUIT")}</p>
            <p>{t("INNER_CONDUIT")}</p>
            <p>{t("DISTANCE")}</p>
          </div>
        </div>
        <div className="passage-view-row-body">
          <div className="passage-view-row">
            <p>GALARH</p>
            <p>FP 1200</p>
            <p>OE50 7x12 Roed Tape</p>
            <p>Subreor 1 - Blaa</p>
            <p>0</p>
          </div>
          <div className="passage-view-row">
            <p>GALARH</p>
            <p>FP 1200</p>
            <p>OE50 7x12 Roed Tape</p>
            <p>Subreor 1 - Blaa</p>
            <p>0</p>
          </div>
          <div className="passage-view-row">
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

export default PassageView;
