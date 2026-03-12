import { useState, useEffect, useCallback, useRef } from "react";
import { getCustomerToken } from "@/lib/workspace-api";
import {
  uploadProjectFile as apiUploadFile,
  sendMessageWithAttachment as apiSendMessageAttachment,
  submitModRequest as apiSubmitModRequest,
  downloadProjectFile as apiDownloadFile,
  deleteProjectFile as apiDeleteFile,
  sendProjectMessage as apiSendMessage,
} from "@/lib/project-details-api";
import { useProjectDetailFetchers } from "@/hooks/use-project-detail-fetchers";
import type {
  ProjectDetails,
  ProjectFileItem,
  MessageItem,
  ModRequestItem,
  ModQuota,
  UseProjectDetailsResult,
} from "@/types/project";

export type { UseProjectDetailsResult };

export function useProjectDetails(
  projectId: string,
  isWorkspaceApi: boolean
): UseProjectDetailsResult {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<ProjectFileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sendingAttachment, setSendingAttachment] = useState(false);
  const [modRequests, setModRequests] = useState<ModRequestItem[]>([]);
  const [modLoading, setModLoading] = useState(false);
  const [modTitle, setModTitle] = useState("");
  const [modDesc, setModDesc] = useState("");
  const [modFiles, setModFiles] = useState<File[]>([]);
  const [sendingMod, setSendingMod] = useState(false);
  const [modQuota, setModQuota] = useState<ModQuota | null>(null);
  const [modError, setModError] = useState<string | null>(null);
  const messageFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { fetchProject, fetchFiles, fetchMessages, fetchModRequests } = useProjectDetailFetchers(
    projectId,
    isWorkspaceApi,
    {
      setProject,
      setLoading,
      setFiles,
      setFilesLoading,
      setMessages,
      setMsgsLoading,
      setModRequests,
      setModQuota,
      setModLoading,
    }
  );

  useEffect(() => {
    void fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project) {
      void fetchFiles();
      void fetchMessages();
      void fetchModRequests();
    }
  }, [project, fetchFiles, fetchMessages, fetchModRequests]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const uploadProjectFile = useCallback(
    async (file: File): Promise<boolean> => {
      const token = getCustomerToken();
      if (!token || !projectId) return false;
      setUploading(true);
      setFileError(null);
      try {
        const result = await apiUploadFile(projectId, file, token);
        if (result.ok) {
          await fetchFiles();
          return true;
        }
        setFileError(result.error ?? "errors.uploadFailed");
        return false;
      } catch {
        setFileError("errors.uploadFailed");
        return false;
      } finally {
        setUploading(false);
      }
    },
    [projectId, fetchFiles]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      void uploadProjectFile(file);
      e.target.value = "";
    },
    [uploadProjectFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file || uploading) return;
      void uploadProjectFile(file);
    },
    [uploading, uploadProjectFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploading) setIsDragOver(true);
    },
    [uploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDownload = useCallback(
    (fileId: number, filename: string) => {
      const token = getCustomerToken();
      if (!token || !projectId) return;
      void apiDownloadFile(projectId, fileId, filename, token);
    },
    [projectId]
  );

  const handleDeleteFile = useCallback(
    async (fileId: number) => {
      const token = getCustomerToken();
      if (!token || !projectId) return;
      if (await apiDeleteFile(projectId, fileId, token)) fetchFiles();
    },
    [projectId, fetchFiles]
  );

  const handleSendMessage = useCallback(async () => {
    if (!msgText.trim()) return;
    const token = getCustomerToken();
    if (!token || !projectId) return;
    setSendingMsg(true);
    try {
      if (await apiSendMessage(projectId, msgText.trim(), token)) {
        setMsgText("");
        fetchMessages();
      }
    } finally {
      setSendingMsg(false);
    }
  }, [msgText, projectId, fetchMessages]);

  const handleMessageAttachment = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const token = getCustomerToken();
      if (!file || !token || !projectId) return;
      setSendingAttachment(true);
      try {
        const ok = await apiSendMessageAttachment(projectId, file, token);
        if (ok) fetchMessages();
      } finally {
        setSendingAttachment(false);
        e.target.value = "";
      }
    },
    [projectId, fetchMessages]
  );

  const handleSubmitMod = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!modTitle.trim() || !modDesc.trim()) return;
      const token = getCustomerToken();
      if (!token) return;
      setSendingMod(true);
      setModError(null);
      try {
        const result = await apiSubmitModRequest(
          projectId,
          modTitle.trim(),
          modDesc.trim(),
          modFiles,
          token
        );
        if (result.ok) {
          setModTitle("");
          setModDesc("");
          setModFiles([]);
          try {
            await fetchModRequests();
          } catch {
            setModError("errors.modSentRefreshFailed");
          }
        } else {
          setModError(result.error ?? "errors.modSendError");
        }
      } catch {
        setModError("errors.connectionError");
      } finally {
        setSendingMod(false);
      }
    },
    [modTitle, modDesc, modFiles, projectId, fetchModRequests]
  );

  return {
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
    fetchFiles,
    fetchMessages,
    fetchModRequests,
    uploadProjectFile,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleDownload,
    handleDeleteFile,
    handleSendMessage,
    handleMessageAttachment,
    handleSubmitMod,
  } as UseProjectDetailsResult;
}
