import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { NewProjectSuccess } from "@/components/new-project/NewProjectSuccess";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("NewProjectSuccess", () => {
  it("renders success message and Voltar ao Painel button", () => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    render(<NewProjectSuccess locale="pt" />);
    expect(screen.getByText("Solicitação Enviada!")).toBeInTheDocument();
    expect(
      screen.getByText(/Analisaremos sua solicitação de projeto e entraremos em contato/)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Voltar ao Painel/i })).toBeInTheDocument();
  });
});
