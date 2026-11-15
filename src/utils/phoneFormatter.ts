export function formatPhoneValue(raw: string): string {
  const trimmed = (raw || '').trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return hasPlus ? '+' : '';

  const parts: string[] = [];
  const firstLen = Math.min(2, digits.length);
  parts.push(digits.slice(0, firstLen));
  let index = firstLen;
  while (index < digits.length) {
    parts.push(digits.slice(index, index + 5));
    index += 5;
  }
  return (hasPlus ? '+' : '') + parts.join(' ');
}
