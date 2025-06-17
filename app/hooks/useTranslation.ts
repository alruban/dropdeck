import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";

import en from "../translations/en.json";
import ar from "../translations/ar.json";
import cs from "../translations/cs.json";
import da from "../translations/da.json";
import de from "../translations/de.json";
import el from "../translations/el.json";
import es from "../translations/es.json";
import fi from "../translations/fi.json";
import fr from "../translations/fr.json";
import he from "../translations/he.json";
import hi from "../translations/hi.json";
import id from "../translations/id.json";
import it from "../translations/it.json";
import ja from "../translations/ja.json";
import ko from "../translations/ko.json";
import nl from "../translations/nl.json";
import no from "../translations/no.json";
import pl from "../translations/pl.json";
import ptBR from "../translations/pt-BR.json";
import ptPT from "../translations/pt-PT.json";
import ru from "../translations/ru.json";
import sv from "../translations/sv.json";
import th from "../translations/th.json";
import tr from "../translations/tr.json";
import vi from "../translations/vi.json";
import zhCN from "../translations/zh-CN.json";
import zhTW from "../translations/zh-TW.json";

const translations = {
  en,
  ar,
  cs,
  da,
  de,
  el,
  es,
  fi,
  fr,
  he,
  hi,
  id,
  it,
  ja,
  ko,
  nl,
  no,
  pl,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  ru,
  sv,
  th,
  tr,
  vi,
  "zh-CN": zhCN,
  "zh-TW": zhTW
} as const;

export type Locale = keyof typeof translations;

export function useTranslation() {
  const { data } = useLoaderData<{ data: { locale: Locale } }>();
  const [locale, setLocaleState] = useState<Locale>(data?.locale || "en");
  const app = useAppBridge();
  const navigate = useNavigate();

  // Update database when locale changes
  const setLocale = async (newLocale: Locale) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
      fetch("/app/api-update-locale", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `locale=${newLocale}`,
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update locale');
        }
        return response.json();
      })
      .then((data) => {
        navigate(".", { replace: true });
      })
      .catch((error) => {
        console.error('Error updating locale:', error);
        // Revert the locale state if the update failed
        setLocaleState(locale);
      });
    }
  };

  useEffect(() => {
    if (app?.config?.locale) {
      const detectedLocale = app?.config?.locale as Locale;
      if (translations[detectedLocale]) {
        setLocale(detectedLocale);
      }
    }
  }, [app]);

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return `Error: translation not found for key "${key}"`;
      }
    }

    if (typeof value !== "string") {
      return `Error: translation not found for key "${key}"`;
    }

    if (variables) {
      return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
        return variables[key]?.toString() ?? match;
      });
    }

    return value;
  };

  return { t, locale, setLocale };
}
