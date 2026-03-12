import type { Invoice, StatusFilter } from "@/types/billing";

describe("billing types", () => {
  it("Invoice has required fields", () => {
    const inv: Invoice = {
      id: 1,
      project_name: "Fatura #1",
      amount: 1500.5,
      status: "paid",
      date: "2025-01-15",
      due_date: "2025-01-15",
      isErp: true,
    };
    expect(inv.id).toBe(1);
    expect(inv.status).toBe("paid");
    expect(inv.amount).toBe(1500.5);
  });

  it("StatusFilter is all | pending | paid", () => {
    const filters: StatusFilter[] = ["all", "pending", "paid"];
    expect(filters).toHaveLength(3);
    expect(filters).toContain("all");
  });
});
