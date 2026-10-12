import { useLocaleState } from "ra-core";
import { useEffect } from "react";

import { RTL_LOCALES } from "../providers/commons/i18nProvider";

/**
 * Keeps <html lang> and <html dir> in sync with the interface language, so
 * Arabic renders right-to-left (Radix components read `dir` from the document).
 */
export const useDocumentDirection = (): "rtl" | "ltr" => {
  const [locale = "en"] = useLocaleState();
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
  }, [locale, dir]);
  return dir;
};
