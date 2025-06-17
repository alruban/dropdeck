import { Select } from "@shopify/polaris";
import { type Locale, useTranslation } from "../../hooks/useTranslation";

const languages = [
  { label: "English", value: "en" },
  { label: "العربية", value: "ar" },
  { label: "Čeština", value: "cs" },
  { label: "Dansk", value: "da" },
  { label: "Deutsch", value: "de" },
  { label: "Ελληνικά", value: "el" },
  { label: "Español", value: "es" },
  { label: "Suomi", value: "fi" },
  { label: "Français", value: "fr" },
  { label: "עברית", value: "he" },
  { label: "हिन्दी", value: "hi" },
  { label: "Bahasa Indonesia", value: "id" },
  { label: "Italiano", value: "it" },
  { label: "日本語", value: "ja" },
  { label: "한국어", value: "ko" },
  { label: "Nederlands", value: "nl" },
  { label: "Norsk", value: "no" },
  { label: "Polski", value: "pl" },
  { label: "Português (Brasil)", value: "pt-BR" },
  { label: "Português (Portugal)", value: "pt-PT" },
  { label: "Русский", value: "ru" },
  { label: "Svenska", value: "sv" },
  { label: "ไทย", value: "th" },
  { label: "Türkçe", value: "tr" },
  { label: "Tiếng Việt", value: "vi" },
  { label: "简体中文", value: "zh-CN" },
  { label: "繁體中文", value: "zh-TW" },
];

export default function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  const handleChange = (value: Locale) => {
    setLocale(value);
  };

  return (
    <div style={{ width: "200px" }}>
      <Select
        label="Language"
        labelHidden
        options={languages}
        onChange={handleChange}
        value={locale}
      />
    </div>
  );
}
