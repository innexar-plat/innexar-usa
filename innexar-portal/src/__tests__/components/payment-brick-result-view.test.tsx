import { render, screen } from "@testing-library/react";
import { PaymentBrickResultView } from "@/components/payment/PaymentBrickResultView";

describe("PaymentBrickResultView", () => {
  it("shows approved message when payment_status is approved", () => {
    const onClose = jest.fn();
    render(<PaymentBrickResultView result={{ payment_status: "approved" }} onClose={onClose} />);
    expect(screen.getByText("Pagamento aprovado.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fechar/i })).toBeInTheDocument();
  });

  it("shows Pix instructions when pending with qr_code", () => {
    render(
      <PaymentBrickResultView
        result={{
          payment_status: "pending",
          qr_code: "pix-copy-paste-code",
        }}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText(/Pix: escaneie o QR Code ou copie o código/)).toBeInTheDocument();
    expect(screen.getByText("pix-copy-paste-code")).toBeInTheDocument();
  });
});
