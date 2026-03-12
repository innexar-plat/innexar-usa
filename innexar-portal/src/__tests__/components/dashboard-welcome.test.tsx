import { render, screen } from "@testing-library/react";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";

describe("DashboardWelcome", () => {
  it("renders welcome with customer name and active summary", () => {
    render(
      <DashboardWelcome
        customerName="Maria"
        welcomeLabel="Olá"
        summaryActiveLabel="Você tem plano ativo."
        summaryInactiveLabel="Nenhum plano ativo."
        hasPlanOrSite={true}
      />
    );
    expect(screen.getByText(/Olá,/)).toBeInTheDocument();
    expect(screen.getByText(/Maria/)).toBeInTheDocument();
    expect(screen.getByText("Você tem plano ativo.")).toBeInTheDocument();
    expect(screen.getByText("Client Portal")).toBeInTheDocument();
  });

  it("renders inactive summary when hasPlanOrSite is false", () => {
    render(
      <DashboardWelcome
        customerName=""
        welcomeLabel="Olá"
        summaryActiveLabel="Ativo"
        summaryInactiveLabel="Inativo"
        hasPlanOrSite={false}
      />
    );
    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });
});
