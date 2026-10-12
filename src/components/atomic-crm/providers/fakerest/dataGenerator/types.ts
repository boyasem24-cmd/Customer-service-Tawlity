import type {
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  Diner,
  DinerNote,
  DinerTag,
  Sale,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  diners: Diner[];
  diner_notes: DinerNote[];
  diner_tags: DinerTag[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
