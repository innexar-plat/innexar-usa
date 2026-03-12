import { redirect } from "next/navigation";

const DEFAULT_LOCALE = "pt";

export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
