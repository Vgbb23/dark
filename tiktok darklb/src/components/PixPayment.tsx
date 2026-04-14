import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Copy, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  extractChargeIdFromFruitfyResponse,
  extractPixCodeFromFruitfyResponse,
  isFruitfyPixPaidPayload,
} from './fruitfyPix';
import { buildFruitfyUtmPayload, useTrackingParams } from '../TrackingParamsContext';

const PIX_API_TOKEN = import.meta.env.VITE_PIX_API_TOKEN || '123|OATyN5kmiQaWvlSQXzvQIZ8l3q21iXTrlwPJcgDNc7f7d141';
const PIX_STORE_ID = import.meta.env.VITE_PIX_STORE_ID || 'a146887d-dcbc-4bdc-9ef3-5b2f8cd90fb6';
const PIX_PRODUCT_ID = import.meta.env.VITE_PIX_PRODUCT_ID || 'a188de59-1342-44ca-83e2-92586c8e4e04';
const PIX_API_BASE_URL = import.meta.env.VITE_PIX_API_BASE_URL || 'https://api.fruitfy.io';
const PIX_API_URL = import.meta.env.VITE_PIX_API_URL || `${PIX_API_BASE_URL}/api/pix/charge`;
/** URL para GET status: use {id} como placeholder do id da cobrança (documentação / painel Fruitfy). */
const PIX_CHARGE_STATUS_URL_TEMPLATE =
  import.meta.env.VITE_PIX_CHARGE_STATUS_URL || `${PIX_API_BASE_URL}/api/pix/charge/{id}`;
const PIX_PAID_REDIRECT_URL =
  import.meta.env.VITE_PIX_PAID_REDIRECT_URL || 'https://rastreiogummy.netlify.app/';

interface PixPaymentProps {
  /** Mesmo valor que o key do pai; evita POST duplicado no Strict Mode (dev). */
  chargeSessionId: number;
  onClose: () => void;
  price: number;
  quantity: number;
  productName: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
}

type PixChargeOutcome =
  | { ok: true; code: string; chargeId: string | null }
  | { ok: false; error: string };

const pixChargeBySession = new Map<number, Promise<PixChargeOutcome>>();

/**
 * Só é montado quando o usuário abre o PIX (Checkout renderiza condicionalmente).
 * O fetch roda uma vez na montagem — não depende de isOpen nem do timer do pai.
 */
export default function PixPayment({
  chargeSessionId,
  onClose,
  price,
  quantity,
  productName,
  customer,
}: PixPaymentProps) {
  const trackingParams = useTrackingParams();
  const trackingRef = useRef(trackingParams);
  trackingRef.current = trackingParams;

  const [timeLeft, setTimeLeft] = useState(86399);
  const [copied, setCopied] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixError, setPixError] = useState('');
  const [pixChargeId, setPixChargeId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const c = customer;
    const q = quantity;
    const totalCents = Math.round(Number(price.toFixed(2)) * 100);

    const runCharge = async (): Promise<PixChargeOutcome> => {
      if (!PIX_API_TOKEN || !PIX_STORE_ID || !PIX_PRODUCT_ID) {
        return { ok: false, error: 'Credenciais da API PIX não configuradas.' };
      }

      const cpfOnly = c.cpf.replace(/\D/g, '');
      const phoneOnly = c.phone.replace(/\D/g, '');
      const fullPhone = phoneOnly.startsWith('55') ? phoneOnly : `55${phoneOnly}`;

      if (!c.name || !c.email || cpfOnly.length !== 11 || fullPhone.length < 12) {
        return { ok: false, error: 'Dados do cliente incompletos para gerar o PIX.' };
      }

      try {
        const utm = buildFruitfyUtmPayload(trackingRef.current);
        const qty = Math.max(q, 1);
        const unitCents = Math.round(totalCents / qty);

        const payload: Record<string, unknown> = {
          name: c.name,
          email: c.email,
          phone: fullPhone,
          cpf: cpfOnly,
          items: [
            {
              id: PIX_PRODUCT_ID,
              value: unitCents,
              quantity: qty,
            },
          ],
        };
        if (utm) payload.utm = utm;

        const response = await fetch(PIX_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Accept-Language': 'pt_BR',
            Authorization: `Bearer ${PIX_API_TOKEN}`,
            'Store-Id': PIX_STORE_ID,
          },
          body: JSON.stringify(payload),
        });

        const rawBody = await response.text();

        if (!response.ok) {
          return {
            ok: false,
            error: `Falha ao gerar PIX (${response.status}): ${rawBody.slice(0, 400) || 'erro desconhecido'}`,
          };
        }

        let data: unknown;
        try {
          data = rawBody ? JSON.parse(rawBody) : null;
        } catch {
          return { ok: false, error: 'Resposta da API não é JSON válido.' };
        }

        const obj = data as Record<string, unknown> | null;
        if (obj && obj.success === false) {
          const msg =
            (typeof obj.message === 'string' && obj.message) ||
            (typeof obj.errors === 'object' && obj.errors !== null
              ? JSON.stringify(obj.errors).slice(0, 300)
              : '');
          return { ok: false, error: msg || 'A API Fruitfy retornou erro (success: false).' };
        }

        const code = extractPixCodeFromFruitfyResponse(data);
        const chargeId = extractChargeIdFromFruitfyResponse(data);

        if (code) {
          return { ok: true, code, chargeId };
        }

        if (import.meta.env.DEV) {
          console.error('[Fruitfy PIX] Resposta sem código EMV reconhecido:', data);
        }
        return {
          ok: false,
          error:
            'A Fruitfy respondeu com sucesso, mas o formato do código PIX mudou ou não veio na resposta. Abra o console (F12) em modo desenvolvimento ou verifique a documentação atualizada.',
        };
      } catch {
        return { ok: false, error: 'Erro de conexão ao gerar PIX.' };
      }
    };

    let cancelled = false;
    setIsLoadingPix(true);
    setPixError('');
    setPixCode('');
    setPixChargeId(null);

    let p = pixChargeBySession.get(chargeSessionId);
    if (!p) {
      p = runCharge();
      pixChargeBySession.set(chargeSessionId, p);
      void p.finally(() => {
        pixChargeBySession.delete(chargeSessionId);
      });
    }

    void p.then((outcome) => {
      if (cancelled) return;
      if (outcome.ok) {
        setPixCode(outcome.code);
        setPixChargeId(outcome.chargeId);
        setPixError('');
        if (import.meta.env.DEV && !outcome.chargeId) {
          console.warn(
            '[Fruitfy PIX] Resposta sem id de cobrança reconhecido; polling de pagamento desativado. Ajuste extractChargeIdFromFruitfyResponse ou VITE_PIX_CHARGE_STATUS_URL.',
          );
        }
      } else {
        setPixCode('');
        setPixChargeId(null);
        setPixError(outcome.error);
      }
      setIsLoadingPix(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot na abertura (chargeSessionId)
  }, [chargeSessionId]);

  useEffect(() => {
    if (!pixChargeId || !pixCode || pixError) return;

    let stopped = false;
    let inFlight = false;

    const statusUrl = PIX_CHARGE_STATUS_URL_TEMPLATE.replace(
      '{id}',
      encodeURIComponent(pixChargeId),
    );

    const pollOnce = async () => {
      if (stopped || inFlight) return;
      inFlight = true;
      try {
        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'pt_BR',
            Authorization: `Bearer ${PIX_API_TOKEN}`,
            'Store-Id': PIX_STORE_ID,
          },
        });
        const rawBody = await response.text();
        if (stopped || !response.ok) return;
        let data: unknown;
        try {
          data = rawBody ? JSON.parse(rawBody) : null;
        } catch {
          return;
        }
        if (isFruitfyPixPaidPayload(data)) {
          stopped = true;
          window.location.assign(PIX_PAID_REDIRECT_URL);
        }
      } catch {
        /* rede / CORS: próximo tick */
      } finally {
        inFlight = false;
      }
    };

    void pollOnce();
    const id = window.setInterval(() => {
      void pollOnce();
    }, 200);

    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [pixChargeId, pixCode, pixError]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatPrice = (p: number) => {
    return p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCopy = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 24);
  const formattedDeadline = `${deadline.getHours().toString().padStart(2, '0')}:${deadline.getMinutes().toString().padStart(2, '0')}, ${deadline.getDate()} de fev 2026`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[500] bg-white flex flex-col font-sans w-full h-full overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-[#FFF0F5] via-[#F0F8FF] to-transparent opacity-60 pointer-events-none" />

        <header className="relative z-10 px-4 py-3 flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="p-1">
            <ChevronLeft className="w-6 h-6 text-[#222222]" />
          </button>
          <h1 className="text-[16px] font-bold text-[#222222]">Código do pagamento</h1>
          <div className="w-8" />
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto px-4 pt-6">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h2 className="text-[22px] font-bold text-[#222222] leading-tight">Aguardando o pagamento</h2>
              <p className="text-[22px] font-bold text-[#222222]">R$ {formatPrice(price)}</p>

              <div className="flex items-center gap-2 mt-4">
                <span className="text-[13px] text-[#888888]">Vence em</span>
                <div className="bg-[#FF2D55] text-white text-[12px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3 fill-white text-[#FF2D55]" />
                  {formatTime(timeLeft)}
                </div>
              </div>
              <p className="text-[12px] text-[#888888] mt-1">Prazo {formattedDeadline}</p>
            </div>

            <div className="w-12 h-12 bg-[#FF9500] rounded-full flex items-center justify-center shadow-sm">
              <Clock className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="bg-white rounded-[12px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-6 border border-gray-50">
            <div className="flex items-center gap-2 mb-8">
              <img src="https://i.ibb.co/Rpv6M6B6/pix.png" className="h-5" alt="Pix" />
              <span className="text-[15px] font-bold text-[#222222]">PIX</span>
            </div>

            <div className="text-[15px] font-bold text-[#222222] break-all mb-8 tracking-tight">
              {isLoadingPix && 'Gerando PIX...'}
              {!isLoadingPix && pixError && pixError}
              {!isLoadingPix && !pixError && pixCode}
            </div>

            {!isLoadingPix && !pixError && (
              <p className="text-[11px] text-[#888888] mb-6">
                {productName} ({quantity} {quantity > 1 ? 'itens' : 'item'})
              </p>
            )}

            <button
              type="button"
              onClick={handleCopy}
              disabled={!pixCode || isLoadingPix}
              className="w-full bg-[#FF2D55] disabled:bg-gray-300 text-white py-3.5 rounded-[6px] flex items-center justify-center gap-2 text-[15px] font-bold active:scale-[0.98] transition-all"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <p className="text-[12px] text-[#222222] leading-tight mb-10">
            Para acessar esta página no app, abra{' '}
            <span className="font-bold">Loja &gt; Pedidos &gt; Sem pagamento &gt; Visualizar o código</span>
          </p>

          <div className="space-y-4">
            <h3 className="text-[18px] font-bold text-[#222222]">Como fazer pagamentos com PIX?</h3>
            <p className="text-[13px] text-[#222222] leading-relaxed">
              Copie o código de pagamento acima, selecione Pix no seu app de internet ou de banco e cole o código.
            </p>
          </div>
        </main>

        <div className="px-4 py-6 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#F5F5F5] text-[#222222] py-3 rounded-[4px] text-[15px] font-bold active:scale-[0.98] transition-transform"
          >
            Ver pedido
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
