export type ProjectDetails = {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at?: string;
};

export type ProjectFileItem = {
  id: number;
  filename: string;
  content_type: string | null;
  size: number;
  created_at: string;
};

export type MessageItem = {
  id: number;
  sender_type: string;
  sender_name: string | null;
  body: string;
  attachment_key: string | null;
  attachment_name: string | null;
  created_at: string;
};

export type ModRequestItem = {
  id: number;
  title: string;
  description: string;
  status: string;
  staff_notes: string | null;
  attachment_name: string | null;
  created_at: string;
};

import type { RefObject } from "react";

export type ModQuota = {
  monthly_limit: number;
  used_this_month: number;
  remaining: number;
};

export type UseProjectDetailsResult = {
  project: ProjectDetails | null;
  loading: boolean;
  files: ProjectFileItem[];
  filesLoading: boolean;
  messages: MessageItem[];
  msgsLoading: boolean;
  modRequests: ModRequestItem[];
  modLoading: boolean;
  modQuota: ModQuota | null;
  uploading: boolean;
  fileError: string | null;
  isDragOver: boolean;
  msgText: string;
  setMsgText: (v: string) => void;
  sendingMsg: boolean;
  sendingAttachment: boolean;
  modTitle: string;
  setModTitle: (v: string) => void;
  modDesc: string;
  setModDesc: (v: string) => void;
  modFiles: File[];
  setModFiles: (f: File[]) => void;
  sendingMod: boolean;
  modError: string | null;
  messageFileInputRef: RefObject<HTMLInputElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  fetchFiles: () => Promise<void>;
  fetchMessages: () => Promise<void>;
  fetchModRequests: () => Promise<void>;
  uploadProjectFile: (file: File) => Promise<boolean>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDownload: (fileId: number, filename: string) => void;
  handleDeleteFile: (fileId: number) => void;
  handleSendMessage: () => void;
  handleMessageAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitMod: (e: React.FormEvent) => void;
};
