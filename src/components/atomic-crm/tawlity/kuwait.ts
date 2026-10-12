/**
 * Kuwait market conventions used across the Tawlity CRM:
 * - currency KWD with 3 decimals (e.g. 25.000 KWD)
 * - phone numbers in +965 format
 * - dates as DD/MM/YYYY
 */

export const KWD_CURRENCY = "KWD";
export const DEFAULT_COUNTRY = "Kuwait";

export const formatKWD = (amount: number | null | undefined): string => {
  const value = Number(amount ?? 0);
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} KWD`;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Formats a date (ISO string or Date) as DD/MM/YYYY. Returns "" for empty values. */
export const formatDateDMY = (
  date: string | Date | null | undefined,
): string => {
  if (!date) return "";
  const d = typeof date === "string" ? parseDate(date) : date;
  if (Number.isNaN(d.valueOf())) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** Parses "YYYY-MM-DD" as a local date (not UTC) and anything else via Date. */
const parseDate = (value: string): Date => {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }
  return new Date(value);
};

/**
 * Normalises a Kuwaiti phone number to "+965 XXXX XXXX".
 * Accepts "+96512345678", "0096512345678", "965 1234 5678" or "12345678".
 * Returns null when the input isn't a valid 8-digit Kuwaiti number.
 */
export const normalizeKuwaitPhone = (
  value: string | null | undefined,
): string | null => {
  if (!value) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00965")) digits = digits.slice(5);
  else if (digits.startsWith("965") && digits.length === 11)
    digits = digits.slice(3);
  if (!/^[124569]\d{7}$/.test(digits)) return null;
  return `+965 ${digits.slice(0, 4)} ${digits.slice(4)}`;
};

/** react-admin validator: empty is allowed, otherwise must be a Kuwaiti number. */
export const validateKuwaitPhone = (value: unknown) => {
  if (value == null || value === "") return undefined;
  if (typeof value === "string" && normalizeKuwaitPhone(value)) {
    return undefined;
  }
  return {
    message: "tawlity.validation.invalid_phone",
    args: { _: "Must be a Kuwaiti number, e.g. +965 1234 5678" },
  };
};

/** Form `parse` helper: stores phones in the canonical +965 format when valid. */
export const parseKuwaitPhone = (value: string) =>
  normalizeKuwaitPhone(value) ?? value;

/**
 * Formats a monetary amount in the configured currency. KWD is always shown
 * with 3 decimals ("25.000 KWD"); other currencies use the browser's format.
 */
export const formatMoney = (
  amount: number | null | undefined,
  currency: string = KWD_CURRENCY,
): string => {
  if (!currency || currency === KWD_CURRENCY) return formatKWD(amount);
  return Number(amount ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  });
};
