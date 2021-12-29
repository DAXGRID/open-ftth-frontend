import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

function CableConnectivity() {
  const { t } = useTranslation();

  return (
    <div className="cable-connectivity">
      <div className="cable-connectivity-container">
        <p className="cable-connectivity__title">K123456789</p>
        <p className="cable-connectivity__title">12 Fiber</p>
        <div className="cable-connectivity-header">
          <div className="cable-connectivity-row">
            <div className="cable-connectivity-row-item">
              <p>{t("A-INFO")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("FROM")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("NO")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("TUBE")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("FIBER")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("TO")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("Z-INFO")}</p>
            </div>
          </div>
        </div>
        <div className="cable-connectivity-body">
          <div className="cable-connectivity-row">
            <div className="cable-connectivity-row-item">
              <span className="cable-connectivity-row-item__icon">
                <FontAwesomeIcon icon={faChevronDown} />
              </span>
              <p> GALAH ODF 1-3-1 WDM 1-4 OLT-1-1-1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>LISA Soem 1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>2</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>Splitter 1 (1:32) Ind 1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>sdfsdfs</p>
            </div>
          </div>
          <div className="cable-connectivity-row">
            <div className="cable-connectivity-row-item">
              <span className="cable-connectivity-row-item__icon">
                <FontAwesomeIcon icon={faChevronDown} />
              </span>
              <p> GALAH ODF 1-3-1 WDM 1-4 OLT-1-1-1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>LISA Soem 1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>2</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>Splitter 1 (1:32) Ind 1</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>sdfsdfs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CableConnectivity;
