/**
 * Workspace backend API config and client.
 * Portal uses the Workspace API (api.innexar.com.br) for customer data.
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
 * Use from client: getCustomerToken() before calling.
 */
export async function workspaceFetch(
  path: string,
  options: RequestInit & { token?: string; tokenType?: TokenType } = {}
): Promise<Response> {
  const { token, tokenType, ...init } = options;
  const base = getWorkspaceApiBase();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401 && token && typeof window !== "undefined") {
    if (path.includes("/api/portal/") || tokenType === "customer") {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      const locale = document.documentElement.lang || "pt";
      window.location.href = `/${locale}/login?session_expired=1`;
    } else if (path.includes("/api/workspace/") || tokenType === "staff") {
      localStorage.removeItem(STAFF_TOKEN_KEY);
      const locale = document.documentElement.lang || "pt";
      window.location.href = `/${locale}/login?session_expired=1`;
    }
  }
  return res;
}

/** Customer token key in localStorage (portal). */
export const CUSTOMER_TOKEN_KEY = "customer_token";
/** Staff token key (not used in portal, kept for API compatibility). */
export const STAFF_TOKEN_KEY = "staff_token";

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function getStaffToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STAFF_TOKEN_KEY);
}
