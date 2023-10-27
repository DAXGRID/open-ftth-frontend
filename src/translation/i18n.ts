import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translation from "./translation.json";

const resources = translation;

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
