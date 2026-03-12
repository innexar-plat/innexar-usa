import { render, screen, fireEvent } from "@testing-library/react";
import { SupportEmptyState } from "@/components/support/SupportEmptyState";

describe("SupportEmptyState", () => {
  it("renders message and Create Your First Ticket button", () => {
    const onNewTicket = jest.fn();
    render(<SupportEmptyState onNewTicket={onNewTicket} />);
    expect(screen.getByText("No Support Tickets")).toBeInTheDocument();
    expect(screen.getByText("You haven't created any support tickets yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Your First Ticket/i })).toBeInTheDocument();
  });

  it("calls onNewTicket when button is clicked", () => {
    const onNewTicket = jest.fn();
    render(<SupportEmptyState onNewTicket={onNewTicket} />);
    fireEvent.click(screen.getByRole("button", { name: /Create Your First Ticket/i }));
    expect(onNewTicket).toHaveBeenCalledTimes(1);
  });
});
