/**
 * Workspace API paths — single source of truth aligned with backend (main.py + *router_workspace*).
 * Base URL from getWorkspaceApiBase(); paths are relative to that.
 * @see innexar-workspace/backend/app/main.py include_router(..., prefix="/api/workspace")
 */

const PREFIX = "/api/workspace" as const;

export const WORKSPACE_API_PATHS = {
  AUTH: {
    STAFF_LOGIN: `${PREFIX}/auth/staff/login`,
    STAFF_FORGOT_PASSWORD: `${PREFIX}/auth/staff/forgot-password`,
    STAFF_RESET_PASSWORD: `${PREFIX}/auth/staff/reset-password`,
  },
  ME: {
    PROFILE: `${PREFIX}/me`,
    PASSWORD: `${PREFIX}/me/password`,
  },
  DASHBOARD: {
    SUMMARY: `${PREFIX}/dashboard/summary`,
    REVENUE: (periodType: string) =>
      `${PREFIX}/dashboard/revenue?period_type=${encodeURIComponent(periodType)}`,
  },
  CUSTOMERS: {
    LIST: `${PREFIX}/customers`,
    DETAIL: (id: string | number) => `${PREFIX}/customers/${id}`,
    SEND_CREDENTIALS: (id: string | number) =>
      `${PREFIX}/customers/${id}/send-credentials`,
    GENERATE_PASSWORD: (id: string | number) =>
      `${PREFIX}/customers/${id}/generate-password`,
    CLEANUP_TEST: `${PREFIX}/customers/cleanup-test`,
  },
  PROJECTS: {
    LIST: `${PREFIX}/projects`,
    DETAIL: (id: string | number) => `${PREFIX}/projects/${id}`,
    FILES: (id: string | number) => `${PREFIX}/projects/${id}/files`,
    FILE_DOWNLOAD: (projectId: string | number, fileId: string | number) =>
      `${PREFIX}/projects/${projectId}/files/${fileId}/download`,
    MESSAGES: (id: string | number) => `${PREFIX}/projects/${id}/messages`,
    MODIFICATION_REQUESTS: (id: string | number) =>
      `${PREFIX}/projects/${id}/modification-requests`,
  },
  MODIFICATION_REQUESTS: {
    UPDATE: (requestId: string | number) =>
      `${PREFIX}/modification-requests/${requestId}`,
  },
  BRIEFINGS: {
    LIST: (projectId?: string | number) =>
      projectId
        ? `${PREFIX}/briefings?project_id=${encodeURIComponent(String(projectId))}`
        : `${PREFIX}/briefings`,
    DETAIL: (id: string | number) => `${PREFIX}/briefings/${id}`,
    DOWNLOAD: (id: string | number) => `${PREFIX}/briefings/${id}/download`,
  },
  ORDERS: {
    LIST: `${PREFIX}/orders`,
  },
  BILLING: {
    PRODUCTS: (withPlans = false) =>
      `${PREFIX}/billing/products${withPlans ? "?with_plans=true" : ""}`,
    PRODUCT_DETAIL: (id: string | number) =>
      `${PREFIX}/billing/products/${id}`,
    PRICE_PLANS: (productId?: string | number) =>
      productId
        ? `${PREFIX}/billing/price-plans?product_id=${encodeURIComponent(String(productId))}`
        : `${PREFIX}/billing/price-plans`,
    PRICE_PLAN_DETAIL: (id: string | number) =>
      `${PREFIX}/billing/price-plans/${id}`,
    SUBSCRIPTIONS: (customerId?: string | number) =>
      customerId
        ? `${PREFIX}/billing/subscriptions?customer_id=${encodeURIComponent(String(customerId))}`
        : `${PREFIX}/billing/subscriptions`,
    INVOICES: (customerId?: string | number) =>
      customerId
        ? `${PREFIX}/billing/invoices?customer_id=${encodeURIComponent(String(customerId))}`
        : `${PREFIX}/billing/invoices`,
    INVOICE_PAYMENT_LINK: (
      invoiceId: string | number,
      successUrl: string,
      cancelUrl: string
    ) =>
      `${PREFIX}/billing/invoices/${invoiceId}/payment-link?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`,
    INVOICE_PAY_BRICKS: (invoiceId: string | number) =>
      `${PREFIX}/billing/invoices/${invoiceId}/pay-bricks`,
    INVOICE_MARK_PAID: (invoiceId: string | number) =>
      `${PREFIX}/billing/invoices/${invoiceId}/mark-paid`,
    PROCESS_OVERDUE: `${PREFIX}/billing/process-overdue`,
    GENERATE_RECURRING: `${PREFIX}/billing/generate-recurring-invoices`,
  },
  SUPPORT: {
    TICKETS: (query?: string) =>
      query ? `${PREFIX}/support/tickets?${query}` : `${PREFIX}/support/tickets`,
    TICKET_DETAIL: (id: string | number) =>
      `${PREFIX}/support/tickets/${id}`,
    TICKET_MESSAGES: (id: string | number) =>
      `${PREFIX}/support/tickets/${id}/messages`,
  },
  CRM: {
    CONTACTS: `${PREFIX}/crm/contacts`,
    CONTACT_DETAIL: (id: string | number) =>
      `${PREFIX}/crm/contacts/${id}`,
  },
  HESTIA: {
    OVERVIEW: `${PREFIX}/hestia/overview`,
    PACKAGES: `${PREFIX}/hestia/packages`,
    USERS: `${PREFIX}/hestia/users`,
    USER_DETAIL: (user: string) => `${PREFIX}/hestia/users/${encodeURIComponent(user)}`,
    USER_DOMAINS: (user: string) =>
      `${PREFIX}/hestia/users/${encodeURIComponent(user)}/domains`,
    USER_DOMAIN_DETAIL: (user: string, domain: string) =>
      `${PREFIX}/hestia/users/${encodeURIComponent(user)}/domains/${encodeURIComponent(domain)}`,
    USER_SUSPEND: (user: string) =>
      `${PREFIX}/hestia/users/${encodeURIComponent(user)}/suspend`,
    USER_UNSUSPEND: (user: string) =>
      `${PREFIX}/hestia/users/${encodeURIComponent(user)}/unsuspend`,
  },
  CONFIG: {
    INTEGRATIONS: `${PREFIX}/config/integrations`,
    INTEGRATION_DETAIL: (id: string | number) =>
      `${PREFIX}/config/integrations/${id}`,
    INTEGRATION_TEST: (id: string | number) =>
      `${PREFIX}/config/integrations/${id}/test`,
    HESTIA_SETTINGS: `${PREFIX}/config/hestia/settings`,
  },
} as const;
