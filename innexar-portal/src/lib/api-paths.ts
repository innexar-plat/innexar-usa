/**
 * Portal API paths (see API_PORTAL.md).
 * Base URL is from getWorkspaceApiBase(); paths are relative to that.
 */

export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/public/auth/customer/login",
    CHECKOUT_LOGIN: "/api/public/auth/customer/checkout-login",
    FORGOT_PASSWORD: "/api/public/auth/customer/forgot-password",
    RESET_PASSWORD: "/api/public/auth/customer/reset-password",
  },
  ME: {
    FEATURES: "/api/portal/me/features",
    DASHBOARD: "/api/portal/me/dashboard",
    PROFILE: "/api/portal/me/profile",
    PASSWORD: "/api/portal/me/password",
    SET_PASSWORD: "/api/portal/me/set-password",
    PROJECT_AGUARDANDO_BRIEFING: "/api/portal/me/project-aguardando-briefing",
  },
  PROJECTS: {
    LIST: "/api/portal/projects",
    DETAIL: (id: string | number) => `/api/portal/projects/${id}`,
    FILES: (id: string | number) => `/api/portal/projects/${id}/files`,
    FILE_DOWNLOAD: (projectId: string | number, fileId: string | number) =>
      `/api/portal/projects/${projectId}/files/${fileId}/download`,
    FILE_DELETE: (projectId: string | number, fileId: string | number) =>
      `/api/portal/projects/${projectId}/files/${fileId}`,
    MESSAGES: (id: string | number) => `/api/portal/projects/${id}/messages`,
    MESSAGES_UPLOAD: (id: string | number) => `/api/portal/projects/${id}/messages/upload`,
    MODIFICATION_REQUESTS: (id: string | number) =>
      `/api/portal/projects/${id}/modification-requests`,
  },
  NEW_PROJECT: "/api/portal/new-project",
  SITE_BRIEFING: "/api/portal/site-briefing",
  SITE_BRIEFING_UPLOAD: "/api/portal/site-briefing/upload",
  INVOICES: {
    LIST: "/api/portal/invoices",
    DETAIL: (id: string | number) => `/api/portal/invoices/${id}`,
    PAY: (id: string | number) => `/api/portal/invoices/${id}/pay`,
    DOWNLOAD: (id: string | number) => `/api/portal/invoices/${id}/download`,
  },
  TICKETS: {
    LIST: "/api/portal/tickets",
    DETAIL: (id: string | number) => `/api/portal/tickets/${id}`,
    MESSAGES: (id: string | number) => `/api/portal/tickets/${id}/messages`,
  },
  NOTIFICATIONS: {
    LIST: "/api/portal/notifications",
    READ: (id: string | number) => `/api/portal/notifications/${id}/read`,
  },
} as const;
