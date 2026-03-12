import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Innexar Workspace",
  description:
    "Sign in to the Innexar Workspace admin panel to manage customers, projects, and billing.",
  robots: "noindex, nofollow",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
