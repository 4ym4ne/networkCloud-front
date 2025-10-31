const RELATIVE_THRESHOLD = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

function getRelativeTimeFormat() {
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
}

export function formatRelativeTime(input: string | Date | number) {
  const date = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  const timestamp = date?.getTime?.() ?? Number.NaN;
  if (!Number.isFinite(timestamp)) return "";

  const now = Date.now();
  const delta = timestamp - now;

  const rtf = getRelativeTimeFormat();

  const absDelta = Math.abs(delta);
  if (absDelta < RELATIVE_THRESHOLD.minute) {
    const seconds = Math.round(delta / 1000);
    return rtf.format(seconds, "second");
  }
  if (absDelta < RELATIVE_THRESHOLD.hour) {
    const minutes = Math.round(delta / (60 * 1000));
    return rtf.format(minutes, "minute");
  }
  if (absDelta < RELATIVE_THRESHOLD.day) {
    const hours = Math.round(delta / (60 * 60 * 1000));
    return rtf.format(hours, "hour");
  }
  const days = Math.round(delta / RELATIVE_THRESHOLD.day);
  return rtf.format(days, "day");
}

export function formatToLocale(input: string | Date | number, options?: Intl.DateTimeFormatOptions) {
  const date = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  const timestamp = date?.getTime?.() ?? Number.NaN;
  if (!Number.isFinite(timestamp)) return "";

  const formatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined,
    ...options,
  });

  return formatter.format(date);
}
