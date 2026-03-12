"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

const FOCUS_CLASS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)] rounded-xl";

type HeaderAvatarProps = {
  customerName?: string;
  avatarUrl?: string | null;
};

export function HeaderAvatar({ customerName, avatarUrl }: HeaderAvatarProps) {
  const locale = useLocale();
  const initial = (customerName || "C")[0].toUpperCase();

  return (
    <Link
      href={`/${locale}/profile`}
      aria-label="Go to profile"
      className={`block w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ${FOCUS_CLASS}`}
      style={{
        background: "linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)",
      }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={40}
          height={40}
          className="w-full h-full object-cover"
          unoptimized
        />
      ) : (
        <span
          className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
          aria-hidden
        >
          {initial}
        </span>
      )}
    </Link>
  );
}
