/**
 * Lightweight bot detection for public forms: a hidden honeypot field that
 * people never see, and a minimum time between first interaction and submit.
 */
export function minFillTime(defaultMs: number) {
  const override = process.env.FORM_MIN_FILL_MS;
  if (override !== undefined && override !== "" && Number.isFinite(Number(override))) return Number(override);
  return defaultMs;
}

export function looksLikeSpam(data: { company_website?: string; startedAt?: number }, minFillMs: number, now = Date.now()) {
  if (data.company_website && data.company_website.trim() !== "") return true;
  if (typeof data.startedAt === "number" && data.startedAt > 0 && minFillMs > 0) {
    const elapsed = now - data.startedAt;
    if (elapsed >= 0 && elapsed < minFillMs) return true;
  }
  return false;
}
