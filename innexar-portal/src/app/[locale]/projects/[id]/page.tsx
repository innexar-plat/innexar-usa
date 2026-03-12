"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import ProjectStatusPipeline from "@/components/ProjectStatusPipeline";
import { ProjectDetailsHeader } from "@/components/project-details/ProjectDetailsHeader";
import { ProjectDetailsTabs, type TabKey } from "@/components/project-details/ProjectDetailsTabs";
import { ProjectMessagesTab } from "@/components/project-details/ProjectMessagesTab";
import { ProjectFilesTab } from "@/components/project-details/ProjectFilesTab";
import { ProjectModificationsTab } from "@/components/project-details/ProjectModificationsTab";
import { useWorkspaceApi } from "@/lib/workspace-api";
import { useProjectDetails } from "@/hooks/use-project-details";

export default function ProjectDetailsPage() {
  const locale = useLocale();
  const t = useTranslations("projectDetails");
  const params = useParams();
  const projectId = params.id as string;
  const isWorkspaceApi = useWorkspaceApi();

  const [activeTab, setActiveTab] = useState<TabKey>("messages");

  const {
    project,
    loading,
    files,
    filesLoading,
    messages,
    msgsLoading,
    modRequests,
    modLoading,
    modQuota,
    uploading,
    fileError,
    isDragOver,
    msgText,
    setMsgText,
    sendingMsg,
    sendingAttachment,
    modTitle,
    setModTitle,
    modDesc,
    setModDesc,
    modFiles,
    setModFiles,
    sendingMod,
    modError,
    messageFileInputRef,
    messagesEndRef,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleDownload,
    handleDeleteFile,
    handleSendMessage,
    handleMessageAttachment,
    handleSubmitMod,
  } = useProjectDetails(projectId, isWorkspaceApi);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isWorkspaceApi || !project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-theme-primary mb-2">{t("notFound")}</h2>
        <Link href={`/${locale}/projects`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="px-6 py-3 bg-blue-500 rounded-xl text-white font-medium"
          >
            {t("backToProjects")}
          </motion.button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectDetailsHeader project={project} locale={locale} />
      <ProjectStatusPipeline status={project.status} locale={locale} />

      <ProjectDetailsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        messagesCount={messages.length}
        filesCount={files.length}
        modRequestsCount={modRequests.length}
      />

      {activeTab === "messages" && (
        <ProjectMessagesTab
          messages={messages}
          loading={msgsLoading}
          msgText={msgText}
          onMsgTextChange={setMsgText}
          onSendMessage={handleSendMessage}
          onMessageAttachment={handleMessageAttachment}
          sendingMsg={sendingMsg}
          sendingAttachment={sendingAttachment}
          messageFileInputRef={messageFileInputRef}
          messagesEndRef={messagesEndRef}
        />
      )}

      {activeTab === "files" && (
        <ProjectFilesTab
          files={files}
          loading={filesLoading}
          uploading={uploading}
          fileError={fileError}
          isDragOver={isDragOver}
          onFileUpload={handleFileUpload}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDownload={handleDownload}
          onDeleteFile={handleDeleteFile}
        />
      )}

      {activeTab === "modifications" && (
        <ProjectModificationsTab
          modRequests={modRequests}
          modLoading={modLoading}
          modQuota={modQuota}
          modTitle={modTitle}
          modDesc={modDesc}
          modFiles={modFiles}
          modError={modError}
          sendingMod={sendingMod}
          onModTitleChange={setModTitle}
          onModDescChange={setModDesc}
          onModFilesChange={setModFiles}
          onSubmitMod={handleSubmitMod}
        />
      )}
    </div>
  );
}
