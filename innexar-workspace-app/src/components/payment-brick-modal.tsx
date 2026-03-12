'use client';

/**
 * Reusable Mercado Pago Payment Brick modal for paying an invoice.
 * - mode="workspace": staff pays on behalf of customer (POST .../pay-bricks), payer_email required.
 * - mode="portal": customer pays own invoice (POST .../api/portal/invoices/{id}/pay), payer_email optional (backend uses logged-in email).
 * Requires NEXT_PUBLIC_MP_PUBLIC_KEY in env for the Brick to load.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';

const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';

export interface InvoiceForPayment {
  id: number;
  total: number;
  currency: string;
}

export type PaymentBrickMode = 'portal' | 'workspace';

export interface PaymentBrickModalProps {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceForPayment | null;
  mode: PaymentBrickMode;
  /** API base URL (e.g. https://api.innexar.com.br) */
  apiBase: string;
  /** Returns Bearer token for auth (staff or customer depending on mode) */
  getToken: () => string | null;
  /** Called after successful payment (e.g. to refresh list) */
  onSuccess?: () => void;
  /** MP public key for Bricks */
  mpPublicKey: string;
  /** Container id for the Brick (must be unique per instance if multiple modals) */
  containerId?: string;
}

export interface BricksSubmitPayload {
  payment_method_id: string;
  token?: string | null;
  issuer_id?: string;
  installments?: number;
  payer?: { email?: string; name?: string };
}

export function PaymentBrickModal({
  open,
  onClose,
  invoice,
  mode,
  apiBase,
  getToken,
  onSuccess,
  mpPublicKey,
  containerId = 'mp-brick-container',
}: PaymentBrickModalProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [brickReady, setBrickReady] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    payment_status: string;
    error_message?: string;
    qr_code_base64?: string;
    qr_code?: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<{ unmount: () => void } | null>(null);

  const payEndpoint =
    mode === 'portal'
      ? `${apiBase.replace(/\/$/, '')}/api/portal/invoices/${invoice?.id ?? 0}/pay`
      : `${apiBase.replace(/\/$/, '')}/api/workspace/billing/invoices/${invoice?.id ?? 0}/pay-bricks`;

  useEffect(() => {
    if (!mpPublicKey || !open) return;
    const existing = document.querySelector(`script[src="${MP_SDK_URL}"]`);
    if (existing) {
      setSdkLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = MP_SDK_URL;
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) document.body.removeChild(script);
    };
  }, [mpPublicKey, open]);

  const buildBody = useCallback(
    (formData: BricksSubmitPayload) => {
      const paymentMethodId = (formData.payment_method_id ?? '').toString().trim();
      const payerEmail = ((formData.payer as { email?: string })?.email ?? '').toString().trim().toLowerCase();
      const base: Record<string, unknown> = {
        payment_method_id: paymentMethodId,
        token: formData.token ?? null,
        issuer_id: formData.issuer_id ? String(formData.issuer_id) : undefined,
        installments: formData.installments ?? 1,
      };
      if (mode === 'workspace') {
        base.payer_email = payerEmail;
        base.customer_name = (formData.payer as { name?: string })?.name
          ? String((formData.payer as { name?: string }).name)
          : undefined;
      } else {
        if (payerEmail) base.payer_email = payerEmail;
        if ((formData.payer as { name?: string })?.name) base.customer_name = String((formData.payer as { name?: string }).name);
      }
      return base;
    },
    [mode]
  );

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
        containerRef.current.innerHTML = '';
      }

      const MercadoPago = (
        window as unknown as {
          MercadoPago?: new (key: string, opts: { locale: string }) => {
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

      const mp = new MercadoPago(mpPublicKey, { locale: 'pt-BR' });
      const bricksBuilder = mp.bricks();

      const controller = await bricksBuilder.create('payment', containerId, {
        locale: 'pt-BR',
        initialization: {
          amount: invoice.total,
        },
        customization: {
          visual: {
            style: {
              theme: 'dark',
              customVariables: {
                formBackgroundColor: 'transparent',
                baseColor: '#0891b2',
              },
            },
          },
        },
        paymentMethods: {
          bankTransfer: ['pix'],
          ticket: ['bolbradesco'],
          creditCard: 'all',
          debitCard: 'all',
          maxInstallments: 12,
        },
        callbacks: {
          onReady: () => setBrickReady(true),
          onSubmit: async (param: { formData?: Record<string, unknown> }) => {
            const formData = (param.formData ?? param) as BricksSubmitPayload & Record<string, unknown>;
            const paymentMethodId = (formData.payment_method_id ?? formData.paymentMethodId)?.toString().trim();
            if (!paymentMethodId) {
              setError('Selecione um meio de pagamento e preencha os dados.');
              return;
            }
            const payerEmail = ((formData.payer as { email?: string })?.email ?? '').toString().trim().toLowerCase();
            if (mode === 'workspace' && !payerEmail) {
              setError('Informe o e-mail do pagador.');
              return;
            }
            const token = getToken();
            if (!token) {
              setError('Sessão expirada. Faça login novamente.');
              return;
            }
            setSubmitting(true);
            setError('');
            try {
              const body = buildBody({
                payment_method_id: paymentMethodId,
                token: formData.token ?? null,
                issuer_id: (formData.issuer_id ?? formData.issuerId) ? String(formData.issuer_id ?? formData.issuerId) : undefined,
                installments: (formData.installments as number) ?? 1,
                payer: formData.payer as { email?: string; name?: string },
              });
              const res = await fetch(payEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
              });
              const data = (await res.json().catch(() => ({}))) as {
                payment_status?: string;
                error_message?: string;
                qr_code_base64?: string;
                qr_code?: string;
                detail?: string;
              };
              setSubmitting(false);
              if (res.ok) {
                setResult({
                  payment_status: data.payment_status ?? '',
                  error_message: data.error_message,
                  qr_code_base64: data.qr_code_base64,
                  qr_code: data.qr_code,
                });
                if (data.payment_status === 'approved') {
                  onSuccess?.();
                }
              } else {
                setError(typeof data.detail === 'string' ? data.detail : 'Erro ao processar pagamento.');
              }
            } catch {
              setSubmitting(false);
              setError('Erro de conexão. Tente novamente.');
            }
          },
          onError: () => {
            setError('Erro no formulário de pagamento.');
          },
        },
      });

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
  }, [open, sdkLoaded, mpPublicKey, invoice?.id, invoice?.total, payEndpoint, getToken, buildBody, containerId, onSuccess]);

  const handleClose = useCallback(() => {
    setResult(null);
    setError('');
    setBrickReady(false);
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={handleClose}>
      <div
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            Pagar fatura #{invoice?.id} – {invoice?.currency} {invoice?.total.toFixed(2)}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
            <div className="space-y-3">
              {result.payment_status === 'approved' && (
                <p className="text-emerald-400 font-medium">Pagamento aprovado.</p>
              )}
              {result.payment_status === 'pending' && (result.qr_code_base64 || result.qr_code) && (
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
                    <p className="text-xs text-slate-400 break-all font-mono">{result.qr_code}</p>
                  )}
                </div>
              )}
              {result.error_message && <p className="text-amber-400 text-sm">{result.error_message}</p>}
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 min-h-[44px]"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              {!brickReady && !submitting && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              )}
              <div id={containerId} ref={containerRef} className="min-h-[200px]" />
              {submitting && (
                <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
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
