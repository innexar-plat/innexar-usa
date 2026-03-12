import { render, screen, fireEvent } from "@testing-library/react";
import { SupportEmptyState } from "@/components/support/SupportEmptyState";

describe("SupportEmptyState", () => {
  it("renders message and create-first-ticket button", () => {
    const onNewTicket = jest.fn();
    render(<SupportEmptyState onNewTicket={onNewTicket} />);
    expect(screen.getByText("emptyTitle")).toBeInTheDocument();
    expect(screen.getByText("emptySubtitle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /createFirstTicket/i })).toBeInTheDocument();
  });

  it("calls onNewTicket when button is clicked", () => {
    const onNewTicket = jest.fn();
    render(<SupportEmptyState onNewTicket={onNewTicket} />);
    fireEvent.click(screen.getByRole("button", { name: /createFirstTicket/i }));
    expect(onNewTicket).toHaveBeenCalledTimes(1);
  });
});
