import { random } from "faker/locale/en_US";

import type { Company, ContactNote } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";
import { contactNotesByAccountStatus, fill } from "./realisticContent";

/**
 * Two to four notes per contact, telling a story that fits the restaurant's
 * account status (prospect, onboarding, live...).
 */
export const generateContactNotes = (db: Db): ContactNote[] => {
  const notes: ContactNote[] = [];
  db.contacts.forEach((contact) => {
    const company = db.companies.find(
      (c) => c.id === contact.company_id,
    ) as Company;
    const pool =
      contactNotesByAccountStatus[company?.account_status ?? "prospect"] ??
      contactNotesByAccountStatus.prospect;
    const count = Math.min(pool.length, random.arrayElement([1, 2, 2, 3, 4]));
    const picks = random.arrayElements(pool, count);
    let date = new Date(contact.first_seen);
    picks.forEach((pick) => {
      date = randomDate(date);
      contact.last_seen =
        date > new Date(contact.last_seen)
          ? date.toISOString()
          : contact.last_seen;
      notes.push({
        id: notes.length,
        contact_id: contact.id,
        text: fill(pick.text, {
          first: contact.first_name,
          restaurant: company?.name,
          area: company?.area,
          branches: company?.nb_branches ?? 1,
        }),
        date: date.toISOString(),
        sales_id: contact.sales_id!,
        status: pick.status,
      });
    });
  });
  return notes;
};
