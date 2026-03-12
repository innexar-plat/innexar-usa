export interface ProjectSummary {
  id: number;
  name: string;
  status: string;
  created_at: string | null;
  has_files: boolean;
  files_count: number;
}

export interface DashboardData {
  plan: {
    status: string;
    product_name: string;
    price_plan_name: string;
    since: string | null;
    next_due_date?: string | null;
  } | null;
  site: { url: string | null; status: string; domain?: string } | null;
  invoice: {
    id: number;
    status: string;
    due_date: string | null;
    total: number;
    currency: string;
  } | null;
  can_pay_invoice: boolean;
  panel: {
    login: string;
    panel_url: string | null;
    password_hint: string | null;
  } | null;
  support: { tickets_open_count: number };
  messages: { unread_count: number };
  projects?: ProjectSummary[];
  projects_aguardando_briefing?: ProjectSummary[];
  requires_password_change?: boolean;
}
