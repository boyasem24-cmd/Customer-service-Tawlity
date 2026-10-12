/**
 * Choice lists for the Tawlity CRM.
 *
 * Each choice's `name` is a translation key (under `tawlity.choices.*`), so
 * the labels can be translated (English / Arabic). Inputs translate them
 * automatically; to display a value, use `useChoiceLabel` from ./ChoiceLabel.
 */

export type Choice = { id: string; name: string };

const make = (group: string, ids: readonly string[]): Choice[] =>
  ids.map((id) => ({ id, name: `tawlity.choices.${group}.${id}` }));

/* ---------- Restaurants ---------- */

export const cuisineChoices = make("cuisine", [
  "arabic",
  "kuwaiti",
  "lebanese",
  "italian",
  "japanese",
  "indian",
  "american",
  "cafe",
  "bakery_desserts",
  "seafood",
  "steakhouse",
  "other",
]);

export const governorateChoices = make("governorate", [
  "capital",
  "hawalli",
  "farwaniya",
  "ahmadi",
  "jahra",
  "mubarak_al_kabeer",
]);

export const priceRangeChoices = make("price_range", ["KD", "KDD", "KDDD"]);

export const bookingSystemChoices = make("booking_system", [
  "none",
  "sevenrooms",
  "eat_app",
  "social_dms",
  "other",
]);

export const leadSourceChoices = make("lead_source", [
  "door_to_door",
  "referral",
  "meta_ad",
  "gastronomy_association",
  "event_expo",
  "inbound_website",
  "other",
]);

export const accountStatusChoices = make("account_status", [
  "prospect",
  "onboarding",
  "live",
  "paused",
  "churned",
]);

export type AccountStatus =
  | "prospect"
  | "onboarding"
  | "live"
  | "paused"
  | "churned";

/** Tailwind classes for the coloured account status badge. */
export const accountStatusColors: Record<AccountStatus, string> = {
  prospect: "bg-slate-100 text-slate-800 border-slate-300",
  onboarding: "bg-sky-100 text-sky-800 border-sky-300",
  live: "bg-emerald-100 text-emerald-800 border-emerald-300",
  paused: "bg-amber-100 text-amber-800 border-amber-300",
  churned: "bg-rose-100 text-rose-800 border-rose-300",
};

/* ---------- Pipeline & account ---------- */

export const planChoices = make("plan", [
  "free_trial",
  "starter",
  "pro",
  "group_enterprise",
]);

export const lostReasonChoices = make("lost_reason", [
  "price",
  "other_system",
  "not_ready",
  "no_response",
  "other",
]);

export const healthChoices = make("health", ["green", "amber", "red"]);

export type Health = "green" | "amber" | "red";

export const healthColors: Record<Health, string> = {
  green: "#16a34a",
  amber: "#f59e0b",
  red: "#dc2626",
};

export const onboardingChecklistItems = [
  "menu_uploaded",
  "tables_configured",
  "staff_trained",
  "first_live_booking",
  "listed_in_app",
] as const;

export type OnboardingChecklistItem = (typeof onboardingChecklistItems)[number];

/* ---------- Restaurant contacts ---------- */

export const contactRoleChoices = make("contact_role", [
  "owner",
  "partner",
  "general_manager",
  "operations_manager",
  "marketing",
  "front_of_house",
  "other",
]);

export const languageChoices = make("language", ["ar", "en"]);
