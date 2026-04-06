import type { Result } from '../types';

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short',
  });
}

export function formatResultValue(result: Result): string {
  if (result.rawValue != null && result.rawValue !== '') {
    return `${result.rawValue} ${result.unit || ''}`.trim();
  }
  if (result.value == null) return '—';
  return `${result.value} ${result.unit || ''}`.trim();
}

export function formatResultReference(result: Result): string {
  if (result.refText) return result.refText;
  if (result.refMin != null && result.refMax != null) return result.refMin + ' – ' + result.refMax;
  if (result.refMin != null) return '> ' + result.refMin;
  if (result.refMax != null) return '< ' + result.refMax;
  return '—';
}

export function formatFrequencyText(text: string): string {
  if (!text) return '';
  const normalized = text.replace(/\s*;\s*/g, ', ').trim();
  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

export function isOutOfRange(r: Result): boolean {
  if (r.refMin == null || r.refMax == null || r.value == null) return false;
  return r.value < r.refMin || r.value > r.refMax;
}
