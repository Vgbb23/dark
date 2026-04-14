/** Apenas dígitos, limitado. */
export function digitsOnly(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

/** CEP exibido: 00000-000 */
export function formatCepDisplay(digits: string) {
  const d = digits.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** Telefone BR: (00) 00000-0000 ou (00) 0000-0000 */
export function formatPhoneDisplay(digits: string) {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (!d.length) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** CPF exibido: 000.000.000-00 */
export function formatCpfDisplay(digits: string) {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Telefone mascarado para exibição no resumo (últimos 2 dígitos visíveis). */
export function maskPhonePretty(digits: string) {
  const d = digits.replace(/\D/g, '');
  if (d.length < 4) return formatPhoneDisplay(d);
  const ddd = d.slice(0, 2);
  const last2 = d.slice(-2);
  if (d.length <= 10) return `(${ddd}) ••••-${last2}`;
  return `(${ddd}) •••••-${last2}`;
}
