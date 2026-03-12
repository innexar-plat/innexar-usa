import { useCallback, useEffect, useRef, useState } from "react";
import { API_PATHS } from "@/lib/api-paths";

const MP_SDK_URL = "https://sdk.mercadopago.com/js/v2";

export type InvoiceForPayment = {
  id: number;
  total: number;
  currency: string;
};

interface BricksSubmitPayload {
  payment_method_id: string;
  token?: string | null;
  issuer_id?: string;
  installments?: number;
  payer?: { email?: string; name?: string };
}

interface PayApiResponse {
  payment_status?: string;
  error_message?: string;
  qr_code_base64?: string;
  qr_code?: string;
  detail?: string;
}

export type PaymentBrickResult = {
  payment_status: string;
  error_message?: string;
  qr_code_base64?: string;
  qr_code?: string;
};

type UsePaymentBrickParams = {
  open: boolean;
  invoice: InvoiceForPayment | null;
  apiBase: string;
  getToken: () => string | null;
  onSuccess?: () => void;
  onClose: () => void;
  mpPublicKey: string;
  containerId: string;
};

export function usePaymentBrick({
  open,
  invoice,
  apiBase,
  getToken,
  onSuccess,
  onClose,
  mpPublicKey,
  containerId,
}: UsePaymentBrickParams) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [brickReady, setBrickReady] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PaymentBrickResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<{ unmount: () => void } | null>(null);

  const payEndpoint = invoice
    ? `${apiBase.replace(/\/$/, "")}${API_PATHS.INVOICES.PAY(invoice.id)}`
    : "";

  useEffect(() => {
    if (!mpPublicKey || !open) return;
    const existing = document.querySelector(`script[src="${MP_SDK_URL}"]`);
    if (existing) {
      setSdkLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = MP_SDK_URL;
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) document.body.removeChild(script);
    };
  }, [mpPublicKey, open]);

  useEffect(() => {
    if (!open || !sdkLoaded || !mpPublicKey || !invoice || !containerRef.current) return;

    const initBrick = async () => {
      if (controllerRef.current) {
        try {
          controllerRef.current.unmount();
        } catch {
          /* ignore */
        }
        controllerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      const MercadoPago = (
        window as unknown as {
          MercadoPago?: new (
            key: string,
            opts: { locale: string }
          ) => {
            bricks: () => {
              create: (
                name: string,
                container: string,
                opts: Record<string, unknown>
              ) => Promise<{ unmount: () => void }>;
            };
          };
        }
      ).MercadoPago;
      if (!MercadoPago) return;

      const mp = new MercadoPago(mpPublicKey, { locale: "pt-BR" });
      const bricksBuilder = mp.bricks();

      let controller: { unmount: () => void };
      try {
        controller = await bricksBuilder.create("payment", containerId, {
          locale: "pt-BR",
          initialization: { amount: invoice.total },
          customization: {
            visual: {
              style: {
                theme: "dark",
                customVariables: { formBackgroundColor: "transparent", baseColor: "#0891b2" },
              },
            },
            paymentMethods: {
              bankTransfer: ["pix"],
              ticket: ["bolbradesco"],
              creditCard: "all",
              debitCard: "all",
              maxInstallments: 12,
            },
          },
          callbacks: {
            onReady: () => setBrickReady(true),
            onSubmit: async (param: { formData?: Record<string, unknown> }) => {
              const formData = (param.formData ?? param) as BricksSubmitPayload &
                Record<string, unknown>;
              const paymentMethodId = (formData.payment_method_id ?? formData.paymentMethodId)
                ?.toString()
                .trim();
              if (!paymentMethodId) {
                setError("Selecione um meio de pagamento e preencha os dados.");
                return;
              }
              const token = getToken();
              if (!token) {
                setError("Sessão expirada. Faça login novamente.");
                return;
              }
              setSubmitting(true);
              setError("");
              try {
                const payerEmail = ((formData.payer as { email?: string })?.email ?? "")
                  .toString()
                  .trim()
                  .toLowerCase();
                const body: Record<string, unknown> = {
                  payment_method_id: paymentMethodId,
                  token: formData.token ?? null,
                  issuer_id:
                    (formData.issuer_id ?? formData.issuerId)
                      ? String(formData.issuer_id ?? formData.issuerId)
                      : undefined,
                  installments: (formData.installments as number) ?? 1,
                };
                if (payerEmail) body.payer_email = payerEmail;
                if ((formData.payer as { name?: string })?.name)
                  body.customer_name = String((formData.payer as { name?: string }).name);

                const res = await fetch(payEndpoint, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(body),
                });
                const data = (await res.json().catch(() => ({}))) as PayApiResponse;
                setSubmitting(false);
                if (res.ok) {
                  setResult({
                    payment_status: data.payment_status ?? "",
                    error_message: data.error_message,
                    qr_code_base64: data.qr_code_base64,
                    qr_code: data.qr_code,
                  });
                  if (data.payment_status === "approved") onSuccess?.();
                } else {
                  setError(
                    typeof data.detail === "string" ? data.detail : "Erro ao processar pagamento."
                  );
                }
              } catch {
                setSubmitting(false);
                setError("Erro de conexão. Tente novamente.");
              }
            },
            onError: () => setError("Erro no formulário de pagamento."),
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("public key not found") || msg.includes("Could not fetch site ID")) {
          setError(
            "Não foi possível carregar os meios de pagamento (chave Mercado Pago inválida ou bloqueada). " +
              'Se estiver no Microsoft Edge, tente desativar a "Prevenção de rastreamento" para este site ou use Chrome/Firefox. ' +
              "Caso persista, entre em contato com o suporte."
          );
        } else {
          setError(
            "Não foi possível carregar o formulário de pagamento. Tente outro navegador ou mais tarde."
          );
        }
        return;
      }
      controllerRef.current = controller;
    };

    initBrick();
    return () => {
      if (controllerRef.current) {
        try {
          controllerRef.current.unmount();
        } catch {
          /* ignore */
        }
        controllerRef.current = null;
      }
    };
  }, [
    open,
    sdkLoaded,
    mpPublicKey,
    invoice?.id,
    invoice?.total,
    payEndpoint,
    getToken,
    containerId,
    onSuccess,
  ]);

  const handleClose = useCallback(() => {
    setResult(null);
    setError("");
    setBrickReady(false);
    onClose();
  }, [onClose]);

  return {
    sdkLoaded,
    brickReady,
    error,
    submitting,
    result,
    handleClose,
    containerRef,
  };
}
