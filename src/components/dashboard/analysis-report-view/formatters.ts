const decimalFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatNumber(value: number | null | undefined, formatter = decimalFormatter) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "–";
  }
  return formatter.format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "–";
  }
  return `${decimalFormatter.format(value)}%`;
}

export function formatBytes(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "–";
  }
  if (value === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  let size = value;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${decimalFormatter.format(size)} ${units[index]}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
}

export { decimalFormatter, integerFormatter };
