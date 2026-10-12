import { subDays } from "date-fns";

import type { Choice } from "../tawlity/choices";
import { normalizeKuwaitPhone } from "../tawlity/kuwait";
import type { Diner } from "../types";

const make = (group: string, ids: readonly string[]): Choice[] =>
  ids.map((id) => ({ id, name: `tawlity.choices.${group}.${id}` }));

export const platformChoices = make("platform", ["ios", "android", "web"]);

export const acquisitionSourceChoices = make("acquisition_source", [
  "organic",
  "meta_ad",
  "referral",
  "restaurant_qr",
  "other",
]);

export const dinerStatusChoices = make("diner_status", [
  "active",
  "inactive",
  "blocked",
]);

export const dinerGenderChoices = make("diner_gender", ["male", "female"]);

export const supportStatusChoices = make("support_status", [
  "open",
  "resolved",
]);

export const dinerStatusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-300",
  inactive: "bg-slate-100 text-slate-700 border-slate-300",
  blocked: "bg-rose-100 text-rose-800 border-rose-300",
};

/** No-shows above this share of reservations are highlighted in red. */
export const NO_SHOW_ALERT_THRESHOLD = 0.2;

/** No-show rate (0..1), or null when the diner has no reservations yet. */
export const getNoShowRate = (
  diner: Pick<Diner, "total_reservations" | "total_no_shows">,
): number | null => {
  if (!diner.total_reservations) return null;
  return (diner.total_no_shows ?? 0) / diner.total_reservations;
};

export const formatPercent = (rate: number | null) =>
  rate == null ? "—" : `${Math.round(rate * 1000) / 10}%`;

export const getDinerName = (diner?: Partial<Diner> | null) =>
  diner ? `${diner.first_name ?? ""} ${diner.last_name ?? ""}`.trim() : "";

/** Filter value for "inactive for 30+ days" (no booking in the last 30 days). */
export const inactiveSinceFilter = () => ({
  "last_booking_date@lt": subDays(new Date(), 30).toISOString().split("T")[0],
});

/** Normalises a diner before saving: canonical phone, consent date, counters. */
export const cleanupDinerForSave = (data: Diner): Diner => {
  const phone = normalizeKuwaitPhone(data.phone) ?? data.phone;
  return {
    ...data,
    phone,
    whatsapp_consent_date: data.whatsapp_consent
      ? (data.whatsapp_consent_date ?? new Date().toISOString().split("T")[0])
      : null,
    total_reservations: Number(data.total_reservations ?? 0),
    total_no_shows: Number(data.total_no_shows ?? 0),
    total_cancellations: Number(data.total_cancellations ?? 0),
  };
};
