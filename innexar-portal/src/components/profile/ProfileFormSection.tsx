"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { User, Mail, Phone, MapPin, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { CustomerProfile } from "@/types/profile";

const inputBase =
  "w-full pl-12 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500/50";

type ProfileFormSectionProps = {
  profile: CustomerProfile;
  setProfile: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  error: string;
  saving: boolean;
  saved: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export function ProfileFormSection({
  profile,
  setProfile,
  error,
  saving,
  saved,
  onSubmit,
}: ProfileFormSectionProps) {
  const t = useTranslations("profilePage");
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base rounded-2xl p-6"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-theme-primary">
              {profile.name[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary">{profile.name || t("user")}</h2>
            <p className="text-theme-secondary">{profile.email}</p>
          </div>
        </div>
      </motion.div>

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-base rounded-2xl p-6 space-y-6"
      >
        <h2 className="text-lg font-bold text-theme-primary">{t("personalInfo")}</h2>
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              {t("name")}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={inputBase}
                placeholder={t("namePlaceholder")}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              {t("email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
              <input
                type="email"
                value={profile.email}
                disabled
                readOnly
                className="w-full pl-12 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-muted cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-theme-muted mt-1">{t("emailCannotChange")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              {t("phone")}
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
              <input
                type="tel"
                value={profile.phone ?? ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value.trim() || null })}
                className={inputBase}
                placeholder={t("phonePlaceholder")}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            {t("address")}
          </label>
          <div className="grid gap-2">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
              <input
                type="text"
                placeholder={t("street")}
                value={profile.address?.street ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    address: { ...(profile.address ?? {}), street: e.target.value },
                  })
                }
                className={inputBase}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={t("number")}
                value={profile.address?.number ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    address: { ...(profile.address ?? {}), number: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted"
              />
              <input
                type="text"
                placeholder={t("postalCode")}
                value={profile.address?.postal_code ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    address: { ...(profile.address ?? {}), postal_code: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted"
              />
            </div>
            <input
              type="text"
              placeholder={t("complement")}
              value={profile.address?.complement ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  address: { ...(profile.address ?? {}), complement: e.target.value },
                })
              }
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={t("city")}
                value={profile.address?.city ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    address: { ...(profile.address ?? {}), city: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted"
              />
              <input
                type="text"
                placeholder={t("state")}
                value={profile.address?.state ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    address: { ...(profile.address ?? {}), state: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("saving")}
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t("saved")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t("saveChanges")}
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </>
  );
}
