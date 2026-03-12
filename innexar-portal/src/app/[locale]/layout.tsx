import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/contexts/theme-context";
import PortalLayoutWrapper from "./PortalLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });
const locales = ["en", "pt", "es"];

type Props = {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("portal-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t);})();`,
          }}
        />
        <Script
          id="perf-measure-patch"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.performance;if(!p||typeof p.measure!=="function"||p.__patched)return;var o=p.measure.bind(p);p.measure=function(){try{return o.apply(p,arguments)}catch(e){var m=(e&&e.message)||"",n=(e&&e.name)||"";if(m.indexOf("negative time stamp")!==-1||n==="InvalidAccessError"||n==="SyntaxError")return;throw e}};p.__patched=true}catch(_){}})();`,
          }}
        />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <PortalLayoutWrapper>{children}</PortalLayoutWrapper>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "pt" }, { locale: "es" }];
}
