import { useTranslation } from "react-i18next";

function Unauthorized() {
  const { t } = useTranslation();

  return (
    <div className="unauthorized">
      <h1 className="unauthorized__title">{t("UNAUTHORIZED")}</h1>
      <div className="unauthorized-body">
        <p>{t("NO_ACCESS_PAGE")}</p>
        <p>{t("CONTACT_ADMINISTRATOR_ACCESS")} </p>
      </div>
    </div>
  );
}

export default Unauthorized;
