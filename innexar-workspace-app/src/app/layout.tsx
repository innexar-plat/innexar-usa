import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workspace - Innexar",
  description: "Gestão de clientes, projetos, billing e Hestia",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return children;
}
