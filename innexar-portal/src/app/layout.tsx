import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal do Cliente - Innexar",
  description: "Acompanhe seus projetos, faturas e suporte",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return children;
}
