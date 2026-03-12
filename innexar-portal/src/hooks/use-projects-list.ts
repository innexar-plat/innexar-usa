import { useState, useEffect, useCallback } from "react";
import { useWorkspaceApi, workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";
import { getProgressFromStatus } from "@/lib/project-status";
import type { ProjectListItem } from "@/types/projects-list";

export function useProjectsList() {
  const isWorkspaceApi = useWorkspaceApi();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      if (!isWorkspaceApi) {
        setLoading(false);
        return;
      }
      const res = await workspaceFetch(API_PATHS.PROJECTS.LIST, { token });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.projects || [];
      setProjects(
        list.map(
          (p: {
            id: number;
            name: string;
            status: string;
            created_at?: string;
            files_count?: number;
            has_files?: boolean;
          }) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            progress: getProgressFromStatus(p.status),
            created_at: p.created_at || "",
            expected_delivery: null,
            site_url: null,
            files_count: typeof p.files_count === "number" ? p.files_count : 0,
            has_files: Boolean(p.has_files),
          })
        )
      );
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [isWorkspaceApi]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading };
}
