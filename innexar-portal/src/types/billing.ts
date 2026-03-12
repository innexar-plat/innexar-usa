export interface Invoice {
  id: number;
  project_name: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "sent" | "draft";
  date: string;
  due_date: string;
  isErp?: boolean;
}

export type StatusFilter = "all" | "pending" | "paid";
