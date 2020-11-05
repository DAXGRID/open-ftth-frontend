import React from "react";
import { useTranslation } from "react-i18next";
import Diagram from "../../components/Diagram";

function IndexPage() {
  const { t } = useTranslation();

  return (
    <div className="index-page">
      <Diagram />
    </div>
  );
}

export default IndexPage;
