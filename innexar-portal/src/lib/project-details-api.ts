import { API_PATHS } from "@/lib/api-paths";
import { getWorkspaceApiBase } from "@/lib/workspace-api";
import { workspaceFetch } from "@/lib/workspace-api";
import type {
  ProjectDetails,
  ProjectFileItem,
  MessageItem,
  ModRequestItem,
  ModQuota,
} from "@/types/project";

export async function fetchProjectDetail(
  projectId: string,
  token: string
): Promise<ProjectDetails | null> {
  const res = await workspaceFetch(API_PATHS.PROJECTS.DETAIL(projectId), { token });
  if (res.ok) return (await res.json()) as ProjectDetails;
  const listRes = await workspaceFetch(API_PATHS.PROJECTS.LIST, { token });
  if (!listRes.ok) return null;
  const list = await listRes.json();
  const found = list.find((p: ProjectDetails) => String(p.id) === projectId) ?? null;
  return found;
}

export async function fetchProjectFiles(
  projectId: string,
  token: string
): Promise<ProjectFileItem[]> {
  const res = await workspaceFetch(API_PATHS.PROJECTS.FILES(projectId), { token });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchProjectMessages(
  projectId: string,
  token: string
): Promise<MessageItem[]> {
  const res = await workspaceFetch(API_PATHS.PROJECTS.MESSAGES(projectId), { token });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchModRequestsData(
  projectId: string,
  token: string
): Promise<{ items: ModRequestItem[]; quota: ModQuota | null }> {
  const res = await workspaceFetch(API_PATHS.PROJECTS.MODIFICATION_REQUESTS(projectId), { token });
  if (!res.ok) return { items: [], quota: null };
  let data: Record<string, unknown>;
  try {
    const raw = await res.json();
    data = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  } catch {
    return { items: [], quota: null };
  }
  const monthlyLimit =
    typeof data.monthly_limit === "number" ? data.monthly_limit : Number(data.monthly_limit) || 0;
  const usedThisMonth =
    typeof data.used_this_month === "number"
      ? data.used_this_month
      : Number(data.used_this_month) || 0;
  const remaining =
    typeof data.remaining === "number" ? data.remaining : (Number(data.remaining) ?? 0);
  const quota: ModQuota | null =
    data.monthly_limit != null
      ? {
          monthly_limit: monthlyLimit,
          used_this_month: usedThisMonth,
          remaining: Number.isFinite(remaining)
            ? remaining
            : Math.max(0, monthlyLimit - usedThisMonth),
        }
      : null;
  const items = Array.isArray(data.items) ? (data.items as ModRequestItem[]) : [];
  return { items, quota };
}

export async function deleteProjectFile(
  projectId: string,
  fileId: number,
  token: string
): Promise<boolean> {
  const res = await workspaceFetch(API_PATHS.PROJECTS.FILE_DELETE(projectId, fileId), {
    token,
    method: "DELETE",
  });
  return res.ok || res.status === 204;
}

export async function sendProjectMessage(
  projectId: string,
  body: string,
  token: string
): Promise<boolean> {
  const res = await workspaceFetch(API_PATHS.PROJECTS.MESSAGES(projectId), {
    token,
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return res.ok;
}

export async function downloadProjectFile(
  projectId: string,
  fileId: number,
  filename: string,
  token: string
): Promise<void> {
  const base = getWorkspaceApiBase().replace(/\/$/, "");
  const res = await fetch(`${base}${API_PATHS.PROJECTS.FILE_DOWNLOAD(projectId, fileId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function uploadProjectFile(
  projectId: string,
  file: File,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  const base = getWorkspaceApiBase().replace(/\/$/, "");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${base}${API_PATHS.PROJECTS.FILES(projectId)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  return { ok: false, error: typeof data.detail === "string" ? data.detail : "Falha no envio" };
}

export async function sendMessageWithAttachment(
  projectId: string,
  file: File,
  token: string
): Promise<boolean> {
  const base = getWorkspaceApiBase().replace(/\/$/, "");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${base}${API_PATHS.PROJECTS.MESSAGES_UPLOAD(projectId)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.ok;
}

export async function submitModRequest(
  projectId: string,
  title: string,
  description: string,
  files: File[],
  token: string
): Promise<{ ok: boolean; error?: string }> {
  const base = getWorkspaceApiBase().replace(/\/$/, "");
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  for (const file of files) {
    formData.append("file", file);
  }
  try {
    const res = await fetch(`${base}${API_PATHS.PROJECTS.MODIFICATION_REQUESTS(projectId)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    const detail =
      typeof (data as { detail?: unknown }).detail === "string"
        ? (data as { detail: string }).detail
        : "Erro ao enviar";
    return { ok: false, error: detail };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro de conexão";
    return { ok: false, error: message };
  }
}
