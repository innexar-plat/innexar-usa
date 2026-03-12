import { useState, useEffect, useCallback } from "react";
import { useWorkspaceApi, workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";
import type { Invoice, StatusFilter } from "@/types/billing";

export function useBilling() {
  const isWorkspaceApi = useWorkspaceApi();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchInvoices = useCallback(async () => {
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
      const res = await workspaceFetch(API_PATHS.INVOICES.LIST, { token });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.invoices || [];
      setInvoices(
        list.map((inv: { id: number; status: string; due_date?: string; total: number }) => ({
          id: inv.id,
          project_name: `Fatura #${inv.id}`,
          amount: Number(inv.total),
          status: (inv.status === "paid"
            ? "paid"
            : inv.status === "overdue"
              ? "overdue"
              : "pending") as Invoice["status"],
          date: inv.due_date || "",
          due_date: inv.due_date || "",
          isErp: true,
        }))
      );
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [isWorkspaceApi]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, refreshTrigger]);

  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : statusFilter === "paid"
        ? invoices.filter((i) => i.status === "paid")
        : invoices.filter((i) => i.status !== "paid");
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return {
    invoices,
    loading,
    isWorkspaceApi,
    statusFilter,
    setStatusFilter,
    filteredInvoices,
    totalPaid,
    totalPending,
    refresh: () => setRefreshTrigger((t) => t + 1),
  };
}
