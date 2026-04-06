import type { Result, ResultGroup } from '../types';

// Map Supabase result row (snake_case) to app format (camelCase)
export function mapResult(r: Record<string, unknown>): Result {
  return {
    loinc: (r.loinc as string) || '',
    analysis: (r.analysis as string) || '',
    symbol: (r.symbol as string) || '',
    section: (r.section as string) || '',
    value: r.value as number | null,
    rawValue: (r.raw_value as string) || '',
    valueQualifier: (r.value_qualifier as string) || '',
    unit: (r.unit as string) || '',
    refText: (r.ref_text as string) || '',
    refMin: r.ref_min as number | null,
    refMax: r.ref_max as number | null,
    method: (r.method as string) || '',
  };
}

export function groupResultsFromManifest(
  manifest: Array<{ date: string; place: string; id: string; resultCount: number }>,
  itemsCache: Record<string, Result[]>
): ResultGroup[] {
  return manifest.map(s => ({
    date: s.date,
    place: s.place || '',
    file: s.id,
    items: itemsCache[s.id] || null,
    itemCount: s.resultCount,
  }));
}
