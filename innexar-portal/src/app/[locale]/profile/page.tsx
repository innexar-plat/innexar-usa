"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useProfile } from "@/hooks/use-profile";
import { ProfileFormSection } from "@/components/profile/ProfileFormSection";
import { ProfileSecuritySection } from "@/components/profile/ProfileSecuritySection";

export default function ProfilePage() {
  const t = useTranslations("profilePage");
  const { profile, setProfile, loading, saving, saved, error, handleSave } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary mb-2">{t("title")}</h1>
        <p className="text-theme-secondary">{t("subtitle")}</p>
      </div>
      <ProfileFormSection
        profile={profile}
        setProfile={setProfile}
        error={error}
        saving={saving}
        saved={saved}
        onSubmit={handleSave}
      />
      <ProfileSecuritySection />
    </div>
  );
}
