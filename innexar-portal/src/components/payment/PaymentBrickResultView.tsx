"use client";

export type PaymentResult = {
  payment_status: string;
  error_message?: string;
  qr_code_base64?: string;
  qr_code?: string;
};

type PaymentBrickResultViewProps = {
  result: PaymentResult;
  onClose: () => void;
};

export function PaymentBrickResultView({ result, onClose }: PaymentBrickResultViewProps) {
  return (
    <div className="space-y-3">
      {result.payment_status === "approved" && (
        <p className="text-emerald-400 font-medium">Pagamento aprovado.</p>
      )}
      {result.payment_status === "pending" && (result.qr_code_base64 || result.qr_code) && (
        <div className="space-y-2">
          <p className="text-slate-300 text-sm">Pix: escaneie o QR Code ou copie o código.</p>
          {result.qr_code_base64 && (
            <img
              src={`data:image/png;base64,${result.qr_code_base64}`}
              alt="QR Code Pix"
              className="w-48 h-48 mx-auto"
            />
          )}
          {result.qr_code && (
            <p className="text-xs text-theme-secondary break-all font-mono">{result.qr_code}</p>
          )}
        </div>
      )}
      {result.payment_status === "pending" && !result.qr_code_base64 && !result.qr_code && (
        <p className="text-slate-300 text-sm">
          Pagamento em processamento. Siga as instruções do boleto ou aguarde a confirmação.
        </p>
      )}
      {result.error_message && <p className="text-amber-400 text-sm">{result.error_message}</p>}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-2 rounded-xl bg-white/10 text-theme-primary hover:bg-white/20"
      >
        Fechar
      </button>
    </div>
  );
}
