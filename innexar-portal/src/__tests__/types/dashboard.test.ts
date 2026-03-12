import type { DashboardData, ProjectSummary } from "@/types/dashboard";

describe("dashboard types", () => {
  it("ProjectSummary has required fields", () => {
    const summary: ProjectSummary = {
      id: 1,
      name: "Test",
      status: "active",
      created_at: "2025-01-01",
      has_files: false,
      files_count: 0,
    };
    expect(summary.id).toBe(1);
    expect(summary.name).toBe("Test");
    expect(summary.status).toBe("active");
  });

  it("DashboardData allows null plan and site", () => {
    const data: DashboardData = {
      plan: null,
      site: null,
      invoice: null,
      can_pay_invoice: false,
      panel: null,
      support: { tickets_open_count: 0 },
      messages: { unread_count: 0 },
    };
    expect(data.plan).toBeNull();
    expect(data.support.tickets_open_count).toBe(0);
  });
});
