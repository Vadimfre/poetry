/** Локальная дата YYYY-MM-DD + время HH:mm → ISO для API */
export function localDateTimeToIso(date: string, time: string): string | null {
  if (!date.trim()) return null;
  const timePart = (time || "23:59").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const tm = /^(\d{1,2}):(\d{2})$/.exec(timePart);
  if (!m || !tm) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  let h = Number(tm[1]);
  let mi = Number(tm[2]);
  if (h > 23) h = 23;
  if (mi > 59) mi = 59;
  const local = new Date(y, mo - 1, d, h, mi, 0, 0);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

export function todayLocalDateString(): string {
  const n = new Date();
  const y = n.getFullYear();
  const mo = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

export function isDeadlineInFuture(iso: string, skewMs = 60_000): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t > Date.now() + skewMs;
}
