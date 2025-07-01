import i18n                          from "i18next";
import { initReactI18next }           from "react-i18next";
import LanguageDetector               from "i18next-browser-languagedetector";

// Import existing translations
import en                             from "locales/en/translation.json";
import vi                             from "locales/vi/translation.json";

// Import new translation namespaces
import enCommon                       from "locales/en/common.json";
import viCommon                       from "locales/vi/common.json";
import enNavigation                   from "locales/en/navigation.json";
import viNavigation                   from "locales/vi/navigation.json";
import enHomepage                     from "locales/en/homepage.json";
import viHomepage                     from "locales/vi/homepage.json";
import enProducts                     from "locales/en/products.json";
import viProducts                     from "locales/vi/products.json";
import enOrders                       from "locales/en/orders.json";
import viOrders                       from "locales/vi/orders.json";
import enCart                         from "locales/en/cart.json";
import viCart                         from "locales/vi/cart.json";
import enProfile                      from "locales/en/profile.json";
import viProfile                      from "locales/vi/profile.json";
import enCategories                   from "locales/en/categories.json";
import viCategories                   from "locales/vi/categories.json";
import enMessages                     from "locales/en/messages.json";
import viMessages                     from "locales/vi/messages.json";
import enValidation                   from "locales/en/validation.json";
import viValidation                   from "locales/vi/validation.json";

i18n
  .use(LanguageDetector)  // looks at localStorage, navigator.language…
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
        common: enCommon,
        navigation: enNavigation,
        homepage: enHomepage,
        products: enProducts,
        orders: enOrders,
        cart: enCart,
        profile: enProfile,
        categories: enCategories,
        messages: enMessages,
        validation: enValidation,
      },
      vi: {
        translation: vi,
        common: viCommon,
        navigation: viNavigation,
        homepage: viHomepage,
        products: viProducts,
        orders: viOrders,
        cart: viCart,
        profile: viProfile,
        categories: viCategories,
        messages: viMessages,
        validation: viValidation,
      }
    },
    lng: "en",           // fallback
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    // Enable namespace support
    ns: ['translation', 'common', 'navigation', 'homepage', 'products', 'orders', 'cart', 'profile', 'categories', 'messages', 'validation'],
    defaultNS: 'translation',
  });

export default i18n;              // optional – rarely imported manually