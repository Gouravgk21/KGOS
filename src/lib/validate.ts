// Input validation and sanitization utilities

export function sanitizeText(input: string, maxLength = 2000): string {
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML-dangerous chars
    .trim();
}

export function sanitizeNumber(input: unknown, min = 0, max = 1e9): number {
  const n = Number(input);
  if (isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRequired(fields: Record<string, unknown>): string[] {
  return Object.entries(fields)
    .filter(([, v]) => !v && v !== 0)
    .map(([k]) => k);
}

export function sanitizeLead(data: Record<string, unknown>) {
  return {
    companyName: sanitizeText(String(data.companyName || ''), 200),
    contactPerson: sanitizeText(String(data.contactPerson || ''), 200),
    phone: sanitizeText(String(data.phone || ''), 20),
    email: sanitizeText(String(data.email || ''), 200),
    notes: sanitizeText(String(data.notes || ''), 5000),
    opportunityValue: sanitizeNumber(data.opportunityValue),
  };
}
