import { render, screen } from "@testing-library/react";
import { BillingStats } from "@/components/billing/BillingStats";

describe("BillingStats", () => {
  it("renders three stat cards with paid, pending and total", () => {
    render(<BillingStats totalPaid={1000} totalPending={500} totalInvoices={3} locale="pt" />);
    expect(screen.getByText("statTotalPaid")).toBeInTheDocument();
    expect(screen.getByText("statPending")).toBeInTheDocument();
    expect(screen.getByText("statTotalInvoices")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.000,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 500,00")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("uses translation keys for labels", () => {
    render(<BillingStats totalPaid={0} totalPending={0} totalInvoices={0} locale="en" />);
    expect(screen.getByText("statTotalPaid")).toBeInTheDocument();
    expect(screen.getByText("statPending")).toBeInTheDocument();
    expect(screen.getByText("statTotalInvoices")).toBeInTheDocument();
  });
});
