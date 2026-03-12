import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import "../globals.css";
import WorkspaceLayoutWrapper from "./workspace-layout-wrapper";

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
        <NextIntlClientProvider messages={messages} locale={locale}>
          <WorkspaceLayoutWrapper>{children}</WorkspaceLayoutWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "pt" }, { locale: "es" }];
}
