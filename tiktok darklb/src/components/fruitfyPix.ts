/** Detecta string no formato EMV / copia e cola do PIX (BR Code). */
export function looksLikePixEmv(s: string): boolean {
  const t = s.trim();
  if (t.length < 30) return false;
  return t.startsWith('000201') || t.includes('br.gov.bcb.pix');
}

/** Percorre JSON recursivamente e retorna o primeiro texto que pareça PIX EMV. */
export function findPixEmvInJson(value: unknown, depth = 0): string | null {
  if (depth > 14) return null;

  if (typeof value === 'string') {
    const t = value.trim();
    if (looksLikePixEmv(t)) return t;
    if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
      try {
        return findPixEmvInJson(JSON.parse(t), depth + 1);
      } catch {
        /* ignore */
      }
    }
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPixEmvInJson(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (value !== null && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      const found = findPixEmvInJson(v, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

const DIRECT_KEYS = [
  'pix_copy_paste',
  'pix_copia_cola',
  'pixCopyPaste',
  'copy_paste',
  'copyPaste',
  'copia_cola',
  'copiaECola',
  'emv',
  'br_code',
  'brCode',
  'payload',
  'qr_code',
  'qrcode',
  'qrCode',
  'pix_code',
  'code',
  'pix_payload',
];

/** Tenta caminhos comuns antes da busca recursiva. */
export function extractPixCodeFromFruitfyResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;

  const root = data as Record<string, unknown>;
  const inner = root.data;

  const tryObj = (obj: unknown): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    const o = obj as Record<string, unknown>;
    for (const k of DIRECT_KEYS) {
      const v = o[k];
      if (typeof v === 'string' && looksLikePixEmv(v)) return v.trim();
    }
    return null;
  };

  const fromDirect = tryObj(root) || tryObj(inner);
  if (fromDirect) return fromDirect;

  const nested =
    inner && typeof inner === 'object'
      ? [
          (inner as Record<string, unknown>).payment,
          (inner as Record<string, unknown>).pix,
          (inner as Record<string, unknown>).order,
          (inner as Record<string, unknown>).charge,
        ]
      : [];

  for (const n of nested) {
    const t = tryObj(n);
    if (t) return t;
  }

  return findPixEmvInJson(data);
}

const CHARGE_ID_KEYS = [
  'charge_id',
  'chargeId',
  'id',
  'transaction_id',
  'transactionId',
  'pix_charge_id',
  'order_id',
  'orderId',
  'payment_id',
  'paymentId',
];

function pickChargeIdFromObject(o: unknown): string | null {
  if (!o || typeof o !== 'object') return null;
  const r = o as Record<string, unknown>;
  for (const k of CHARGE_ID_KEYS) {
    const v = r[k];
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return null;
}

/** Identificador da cobrança na resposta do POST /api/pix/charge (para consulta de status). */
export function extractChargeIdFromFruitfyResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const inner = root.data;

  const nestedKeys = ['charge', 'payment', 'order', 'transaction', 'pix'];
  const fromNested =
    inner && typeof inner === 'object'
      ? nestedKeys.map((k) => pickChargeIdFromObject((inner as Record<string, unknown>)[k]))
      : [];

  // Preferir ids dentro de `data` / objetos da cobrança antes de um `id` genérico na raiz.
  return (
    fromNested.find((x) => x !== null) ||
    pickChargeIdFromObject(inner) ||
    pickChargeIdFromObject(root) ||
    null
  );
}

const PAID_STATUS_VALUES = new Set([
  'paid',
  'pago',
  'approved',
  'aprovado',
  'completed',
  'concluido',
  'concluded',
  'settled',
  'confirmed',
  'confirmado',
  'succeeded',
  'success',
  'authorized',
  'autorizado',
]);

function normStatus(s: string) {
  return s.trim().toLowerCase();
}

/**
 * Indica se o JSON de status (GET cobrança ou webhook) representa PIX quitado.
 * Aceita vários formatos comuns; ajuste se a Fruitfy usar nomes diferentes.
 */
export function isFruitfyPixPaidPayload(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;

  const visit = (v: unknown, depth: number): boolean => {
    if (depth > 14 || v === null || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;

    if (o.paid === true || o.is_paid === true) return true;
    if (typeof o.paid_at === 'string' && o.paid_at.length > 0) return true;
    if (typeof o.paidAt === 'string' && o.paidAt.length > 0) return true;

    for (const key of ['status', 'payment_status', 'paymentStatus', 'pix_status', 'pixStatus']) {
      const s = o[key];
      if (typeof s === 'string' && PAID_STATUS_VALUES.has(normStatus(s))) return true;
    }

    for (const child of Object.values(o)) {
      if (visit(child, depth + 1)) return true;
    }
    return false;
  };

  return visit(data, 0);
}
