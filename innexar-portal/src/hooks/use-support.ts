import { useState, useEffect, useMemo, useCallback } from "react";
import { useWorkspaceApi, workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";
import type { Ticket } from "@/types/support";

export function useSupport(searchParams: URLSearchParams) {
  const isWorkspaceApi = useWorkspaceApi();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const queryProjectId = searchParams.get("project_id");
  const queryCategory = searchParams.get("category") || undefined;
  const querySubject = searchParams.get("subject") || "";
  const projectIdFromQuery = queryProjectId ? parseInt(queryProjectId, 10) : undefined;
  const openNewFromQuery = searchParams.get("new") === "1";

  const fetchTickets = useCallback(async () => {
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
      const res = await workspaceFetch(API_PATHS.TICKETS.LIST, { token });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setTickets(
          list.map((t: { id: number; subject: string; status: string; created_at: string }) => ({
            id: t.id,
            subject: t.subject,
            status: t.status,
            priority: "normal",
            created_at: t.created_at,
            updated_at: t.created_at,
            message_count: 0,
          }))
        );
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [isWorkspaceApi]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (openNewFromQuery) {
      setShowForm(true);
      if (querySubject) setSubject(querySubject);
    }
  }, [openNewFromQuery, querySubject]);

  const createTicketBody = useMemo(() => {
    const body: { subject: string; category?: string; project_id?: number } = { subject };
    if (queryCategory) body.category = queryCategory;
    if (projectIdFromQuery && !Number.isNaN(projectIdFromQuery))
      body.project_id = projectIdFromQuery;
    return body;
  }, [subject, queryCategory, projectIdFromQuery]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError("");
      const token = getCustomerToken();
      if (!token) return;
      try {
        if (!isWorkspaceApi) {
          setError("Portal configurado para Workspace. Configure NEXT_PUBLIC_USE_WORKSPACE_API.");
          return;
        }
        const res = await workspaceFetch(API_PATHS.TICKETS.LIST, {
          method: "POST",
          token,
          body: JSON.stringify(createTicketBody),
        });
        if (res.ok) {
          setSubject("");
          setMessage("");
          setShowForm(false);
          fetchTickets();
        } else {
          const data = await res.json();
          setError(
            Array.isArray(data.detail)
              ? (data.detail[0]?.msg ?? "Failed")
              : data.detail || "Failed to create ticket"
          );
        }
      } catch {
        setError("Connection error");
      } finally {
        setSubmitting(false);
      }
    },
    [isWorkspaceApi, createTicketBody, fetchTickets]
  );

  return {
    tickets,
    loading,
    showForm,
    setShowForm,
    subject,
    setSubject,
    message,
    setMessage,
    error,
    handleSubmit,
    submitting,
    fetchTickets,
  };
}
