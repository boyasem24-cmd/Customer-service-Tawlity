import type { Identifier, RaRecord } from "ra-core";
import type { ComponentType } from "react";

import type {
  COMPANY_CREATED,
  CONTACT_CREATED,
  CONTACT_NOTE_CREATED,
  DEAL_CREATED,
  DEAL_NOTE_CREATED,
} from "./consts";

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type SalesFormData = {
  avatar?: string;
  email: string;
  secondary_emails?: string[];
  password?: string;
  first_name: string;
  last_name: string;
  administrator: boolean;
  /** Support team member: can see Diners data */
  support?: boolean;
  disabled: boolean;
};

export type Sale = {
  first_name: string;
  last_name: string;
  administrator: boolean;
  /** Support team member: can see Diners data (admins always can) */
  support?: boolean;
  avatar?: RAFile;
  disabled?: boolean;
  user_id: string;

  /**
   * This is a copy of the user's email, to make it easier to handle by react admin
   * DO NOT UPDATE this field directly, it should be updated by the backend
   */
  email: string;

  secondary_emails?: string[];

  /**
   * This is used by the fake rest provider to store the password
   * DO NOT USE this field in your code besides the fake rest provider
   * @deprecated
   */
  password?: string;
} & Pick<RaRecord, "id">;

export type Company = {
  name: string;
  logo: RAFile;
  sector: string;
  size: 1 | 10 | 50 | 250 | 500;
  linkedin_url: string;
  website: string;
  phone_number: string;
  address: string;
  zipcode: string;
  city: string;
  state_abbr: string;
  sales_id?: Identifier;
  created_at: string;
  description: string;
  revenue: string;
  tax_identifier: string;
  country: string;
  context_links?: string[];
  nb_contacts?: number;
  nb_deals?: number;

  // Tawlity restaurant fields
  is_holding?: boolean;
  parent_company_id?: Identifier | null;
  parent_company_name?: string | null;
  nb_brands?: number;
  cuisines?: string[];
  governorate?: string | null;
  area?: string | null;
  nb_branches?: number | null;
  seating_capacity?: number | null;
  price_range?: string | null;
  booking_system?: string | null;
  kga_member?: boolean;
  instagram_handle?: string | null;
  google_maps_url?: string | null;
  lead_source?: string | null;
  account_status?: string | null;

  // Tawlity account management
  contract_start_date?: string | null;
  renewal_date?: string | null;
  plan?: string | null;
  monthly_fee?: number | null;
  onboarding_checklist?: Partial<Record<string, boolean>> | null;
  last_report_sent_at?: string | null;
  health?: string | null;
  health_note?: string | null;
} & Pick<RaRecord, "id">;

export type EmailAndType = {
  email: string;
  type: "Work" | "Home" | "Other";
};

export type PhoneNumberAndType = {
  number: string;
  type: "Work" | "Home" | "Other";
};

export type Contact = {
  first_name: string;
  last_name: string;
  title: string;
  company_id?: Identifier | null;
  email_jsonb: EmailAndType[];
  avatar?: Partial<RAFile>;
  linkedin_url?: string | null;
  first_seen: string;
  last_seen: string;
  has_newsletter: boolean;
  tags: number[];
  gender: string;
  sales_id?: Identifier;
  status: string;
  background: string;
  phone_jsonb: PhoneNumberAndType[];
  nb_tasks?: number;
  company_name?: string;

  // Tawlity restaurant contact fields
  role?: string | null;
  preferred_language?: string | null;
  is_decision_maker?: boolean;
} & Pick<RaRecord, "id">;

export type ContactNote = {
  contact_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  status: string;
  attachments?: AttachmentNote[];
} & Pick<RaRecord, "id">;

export type Deal = {
  name: string;
  company_id: Identifier;
  contact_ids: Identifier[];
  category: string;
  stage: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  expected_closing_date: string;
  sales_id: Identifier;
  index: number;

  // Tawlity pipeline fields (`amount` holds the monthly fee in KWD)
  plan?: string | null;
  nb_branches_covered?: number | null;
  lost_reason?: string | null;
} & Pick<RaRecord, "id">;

export type DealNote = {
  deal_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  attachments?: AttachmentNote[];

  // This is defined for compatibility with `ContactNote`
  status?: undefined;
} & Pick<RaRecord, "id">;

/* ---------- Diners (B2C users of the Tawlity app) ---------- */

export type Diner = {
  first_name: string;
  last_name: string;
  /** Unique, stored as "+965 XXXX XXXX" */
  phone: string;
  /** Digits of `phone`, maintained by the backend for search */
  phone_digits?: string;
  email?: string | null;
  preferred_language?: string | null;
  gender?: string | null;
  signup_date?: string | null;
  signup_platform?: string | null;
  acquisition_source?: string | null;
  total_reservations: number;
  total_no_shows: number;
  total_cancellations: number;
  last_booking_date?: string | null;
  favourite_restaurant_ids: Identifier[];
  whatsapp_consent: boolean;
  whatsapp_consent_date?: string | null;
  status: string;
  tags: Identifier[];
  created_at?: string;
  updated_at?: string;
} & Pick<RaRecord, "id">;

export type DinerTag = {
  name: string;
  color: string;
} & Pick<RaRecord, "id">;

export type DinerNote = {
  diner_id: Identifier;
  text: string;
  date: string;
  sales_id?: Identifier;
  /** "note" for a plain note, "support" for a support interaction */
  kind: string;
  /** For support interactions: "open" or "resolved" */
  support_status?: string | null;
} & Pick<RaRecord, "id">;

export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type Task = {
  contact_id: Identifier;
  type: string;
  text: string;
  due_date: string;
  done_date?: string | null;
  sales_id?: Identifier;
  created_at?: string;
} & Pick<RaRecord, "id">;

export type ActivityCompanyCreated = {
  type: typeof COMPANY_CREATED;
  company_id: Identifier;
  company: Company;
  sales_id: Identifier;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactCreated = {
  type: typeof CONTACT_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  contact: Contact;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactNoteCreated = {
  type: typeof CONTACT_NOTE_CREATED;
  sales_id?: Identifier;
  contactNote: ContactNote;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityDealCreated = {
  type: typeof DEAL_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  deal: Deal;
  date: string;
};

export type ActivityDealNoteCreated = {
  type: typeof DEAL_NOTE_CREATED;
  sales_id?: Identifier;
  dealNote: DealNote;
  date: string;
};

export type Activity = RaRecord &
  (
    | ActivityCompanyCreated
    | ActivityContactCreated
    | ActivityContactNoteCreated
    | ActivityDealCreated
    | ActivityDealNoteCreated
  );

export interface RAFile {
  src: string;
  title: string;
  path?: string;
  rawFile: File;
  type?: string;
}

export type AttachmentNote = RAFile;

export interface LabeledValue {
  value: string;
  label: string;
}

export type DealStage = LabeledValue;

export interface NoteStatus extends LabeledValue {
  color: string;
}

export interface ContactGender {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export type SearchResourceName =
  | "companies"
  | "contacts"
  | "deals"
  | "tasks"
  | "contact_notes"
  | "deal_notes";

export type SearchResult = {
  resource: SearchResourceName;
  record_id: Identifier;
  title: string | null;
  subtitle: string | null;
  contact_id: Identifier | null;
  deal_id: Identifier | null;
  date: string | null;
  /** The searched fields, to show and highlight where the query matched. */
  content: string | null;
};
