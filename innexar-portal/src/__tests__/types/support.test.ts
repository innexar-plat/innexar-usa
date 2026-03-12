import type { Ticket } from "@/types/support";

describe("support types", () => {
  it("Ticket has required fields", () => {
    const ticket: Ticket = {
      id: 1,
      subject: "Help with project",
      status: "open",
      priority: "normal",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      message_count: 2,
    };
    expect(ticket.id).toBe(1);
    expect(ticket.subject).toBe("Help with project");
    expect(ticket.status).toBe("open");
    expect(ticket.message_count).toBe(2);
  });
});
