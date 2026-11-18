/**
 * Satu sumber kebenaran (single source of truth) untuk kategori kerusakan jalan.
 * Sesuai spesifikasi Fase 1.
 */
export const REPORT_CATEGORIES = [
  'Lubang',
  'Retak',
  'Amblas',
  'Genangan/Drainase buruk',
  'Aspal terkelupas',
  'Lainnya',
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export function isValidCategory(category: string): category is ReportCategory {
  return (REPORT_CATEGORIES as readonly string[]).includes(category);
}
