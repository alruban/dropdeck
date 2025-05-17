import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import en from "../translations/en.json";

const translations = {
  en,
  // Add other languages here
} as const;

export function useTranslation() {
  const [locale, setLocale] = useState<keyof typeof translations>("en");
  const app = useAppBridge();

  useEffect(() => {
    if (app?.config?.host) {
      const host = app.config.host;
      const detectedLocale = host.split(".")[0] as keyof typeof translations;
      setLocale(translations[detectedLocale] ? detectedLocale : "en");
    }
  }, [app]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return `Error: translation not found for key "${key}"`;
      }
    }

    return typeof value === "string" ? value : `Error: translation not found for key "${key}"`;
  };

  return { t };
}
