import { useCallback } from "react";
import { getCustomerToken } from "@/lib/workspace-api";
import {
  fetchProjectDetail,
  fetchProjectFiles as apiFetchFiles,
  fetchProjectMessages as apiFetchMessages,
  fetchModRequestsData as apiFetchModData,
} from "@/lib/project-details-api";
import type {
  ProjectDetails,
  ProjectFileItem,
  MessageItem,
  ModRequestItem,
  ModQuota,
} from "@/types/project";

export type ProjectDetailFetchersSetters = {
  setProject: (v: ProjectDetails | null) => void;
  setLoading: (v: boolean) => void;
  setFiles: (v: ProjectFileItem[] | ((prev: ProjectFileItem[]) => ProjectFileItem[])) => void;
  setFilesLoading: (v: boolean) => void;
  setMessages: (v: MessageItem[] | ((prev: MessageItem[]) => MessageItem[])) => void;
  setMsgsLoading: (v: boolean) => void;
  setModRequests: (v: ModRequestItem[] | ((prev: ModRequestItem[]) => ModRequestItem[])) => void;
  setModQuota: (v: ModQuota | null) => void;
  setModLoading: (v: boolean) => void;
};

export function useProjectDetailFetchers(
  projectId: string,
  isWorkspaceApi: boolean,
  setters: ProjectDetailFetchersSetters
) {
  const {
    setProject,
    setLoading,
    setFiles,
    setFilesLoading,
    setMessages,
    setMsgsLoading,
    setModRequests,
    setModQuota,
    setModLoading,
  } = setters;

  const fetchProject = useCallback(async () => {
    const token = getCustomerToken();
    if (!token || !isWorkspaceApi) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchProjectDetail(projectId, token);
      setProject(data);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, isWorkspaceApi, setProject, setLoading]);

  const fetchFiles = useCallback(async () => {
    const token = getCustomerToken();
    if (!token || !isWorkspaceApi || !projectId) return;
    setFilesLoading(true);
    try {
      const data = await apiFetchFiles(projectId, token);
      setFiles(data);
    } finally {
      setFilesLoading(false);
    }
  }, [projectId, isWorkspaceApi, setFiles, setFilesLoading]);

  const fetchMessages = useCallback(async () => {
    const token = getCustomerToken();
    if (!token || !isWorkspaceApi || !projectId) return;
    setMsgsLoading(true);
    try {
      const data = await apiFetchMessages(projectId, token);
      setMessages(data);
    } finally {
      setMsgsLoading(false);
    }
  }, [projectId, isWorkspaceApi, setMessages, setMsgsLoading]);

  const fetchModRequests = useCallback(async () => {
    const token = getCustomerToken();
    if (!token || !isWorkspaceApi || !projectId) return;
    setModLoading(true);
    try {
      const { items, quota } = await apiFetchModData(projectId, token);
      setModRequests(Array.isArray(items) ? items : []);
      setModQuota(quota ?? null);
    } catch {
      setModRequests([]);
      setModQuota(null);
    } finally {
      setModLoading(false);
    }
  }, [projectId, isWorkspaceApi, setModRequests, setModQuota, setModLoading]);

  return { fetchProject, fetchFiles, fetchMessages, fetchModRequests };
}
