import i18n                          from "i18next";
import { initReactI18next }           from "react-i18next";
import LanguageDetector               from "i18next-browser-languagedetector";

import en                             from "locales/en/translation.json";
import vi                             from "locales/vi/translation.json";

i18n
  .use(LanguageDetector)  // looks at localStorage, navigator.language…
  .use(initReactI18next)
  .init({
    resources : { en:{ translation: en }, vi:{ translation: vi } },
    lng       : "en",           // fallback
    fallbackLng: "en",
    interpolation: { escapeValue:false },
  });

export default i18n;              // optional – rarely imported manually
