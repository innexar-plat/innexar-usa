import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
