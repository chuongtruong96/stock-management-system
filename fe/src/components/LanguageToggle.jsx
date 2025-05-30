import { IconButton } from "@mui/material";
import TranslateIcon  from "@mui/icons-material/Translate";
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  return (
    <IconButton
      color="inherit"
      onClick={() =>
        i18n.changeLanguage(i18n.language === "en" ? "vi" : "en")
      }
      size="small"
    >
      <TranslateIcon fontSize="small" />
    </IconButton>
  );
}
