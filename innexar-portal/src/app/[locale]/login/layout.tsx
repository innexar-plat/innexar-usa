import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Innexar Customer Portal",
  description:
    "Sign in to your Innexar customer portal to manage your projects, billing, and support.",
  robots: "noindex, nofollow",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
