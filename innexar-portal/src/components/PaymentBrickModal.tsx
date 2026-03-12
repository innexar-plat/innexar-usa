"use client";

/**
 * Mercado Pago Payment Brick modal for portal: pay invoice with Pix and boleto only.
 * POST {apiBase}/api/portal/invoices/{id}/pay with payment_method_id (Bricks flow).
 * Requires NEXT_PUBLIC_MP_PUBLIC_KEY in env.
 */
import { AlertCircle, Loader2, X } from "lucide-react";
import { usePaymentBrick } from "@/hooks/use-payment-brick";
import { PaymentBrickResultView } from "@/components/payment/PaymentBrickResultView";

export type { InvoiceForPayment } from "@/hooks/use-payment-brick";

export interface PaymentBrickModalProps {
  open: boolean;
  onClose: () => void;
  invoice: { id: number; total: number; currency: string } | null;
  apiBase: string;
  getToken: () => string | null;
  onSuccess?: () => void;
  mpPublicKey: string;
  containerId?: string;
}

export function PaymentBrickModal({
  open,
  onClose,
  invoice,
  apiBase,
  getToken,
  onSuccess,
  mpPublicKey,
  containerId = "mp-brick-container-portal",
}: PaymentBrickModalProps) {
  const { brickReady, error, submitting, result, handleClose, containerRef } = usePaymentBrick({
    open,
    invoice,
    apiBase,
    getToken,
    onSuccess,
    onClose,
    mpPublicKey,
    containerId,
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-theme-primary">
            Pagar fatura #{invoice?.id} – {invoice?.currency} {invoice?.total.toFixed(2)}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {result ? (
            <PaymentBrickResultView result={result} onClose={handleClose} />
          ) : (
            <>
              {!brickReady && !submitting && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              )}
              <div id={containerId} ref={containerRef} className="min-h-[200px]" />
              {submitting && (
                <div className="mt-4 flex items-center justify-center gap-2 text-theme-secondary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando…
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
