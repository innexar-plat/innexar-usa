/**
 * Workspace backend API config and client.
 * When NEXT_PUBLIC_USE_WORKSPACE_API=true, the workspace app uses the Workspace API (api.innexar.com.br).
 */

const USE_WORKSPACE_API =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_USE_WORKSPACE_API === "true"
    : process.env.NEXT_PUBLIC_USE_WORKSPACE_API === "true";

const WORKSPACE_API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_WORKSPACE_API_URL || "").replace(/\/$/, "")
    : (process.env.NEXT_PUBLIC_WORKSPACE_API_URL || "").replace(/\/$/, "");

export function useWorkspaceApi(): boolean {
  return USE_WORKSPACE_API && !!WORKSPACE_API_URL;
}

export function getWorkspaceApiBase(): string {
  return WORKSPACE_API_URL;
}

export type TokenType = "customer" | "staff";

/**
 * Fetch from workspace API with optional Bearer token.
 * Use getStaffToken() from localStorage before calling.
 * On 401 (staff token): clears token and redirects to workspace login.
 */
export async function workspaceFetch(
  path: string,
  options: RequestInit & { token?: string; tokenType?: TokenType } = {}
): Promise<Response> {
  const { token, tokenType, ...init } = options;
  const base = getWorkspaceApiBase();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (
    !headers.has("Content-Type") &&
    init.body &&
    typeof init.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers });
  if (
    res.status === 401 &&
    token &&
    (path.includes("/api/workspace/") || tokenType === "staff")
  ) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STAFF_TOKEN_KEY);
      const locale = document.documentElement.lang || "pt";
      window.location.href = `/${locale}/login?session_expired=1`;
    }
  }
  return res;
}

/**
 * Fetch workspace API with staff token (from localStorage).
 * Use for all authenticated workspace routes. On 401 clears token and redirects to login.
 */
export async function workspaceFetchStaff(
  path: string,
  init: RequestInit & { token?: string } = {}
): Promise<Response> {
  const token = init.token ?? getStaffToken();
  return workspaceFetch(path, {
    ...init,
    token: token ?? undefined,
    tokenType: "staff",
  });
}

/**
 * Parse FastAPI error body: { detail: string } or { detail: [{ msg: string }] }.
 * Returns a single error message string.
 */
export function parseWorkspaceError(
  data: { detail?: string | Array<{ msg?: string }> } | unknown
): string {
  if (!data || typeof data !== "object") return "Erro desconhecido";
  const d = (data as { detail?: string | Array<{ msg?: string }> }).detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  return "Erro desconhecido";
}

export const CUSTOMER_TOKEN_KEY = "customer_token";
export const STAFF_TOKEN_KEY = "staff_token";

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function getStaffToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STAFF_TOKEN_KEY);
}
