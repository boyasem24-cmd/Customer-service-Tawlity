import { datatype, random } from "faker/locale/en_US";

import { defaultTaskTypes } from "../../../root/defaultConfiguration";
import type { Task } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const taskTexts: Record<string, string[]> = {
  visit: ["Drop by during lunch service", "Visit with demo tablet"],
  call: ["Call to confirm go-live date", "Follow up on pricing questions"],
  whatsapp: ["Send WhatsApp recap of the demo", "WhatsApp the onboarding link"],
  demo: ["Demo the waitlist and table map", "Demo the reservations dashboard"],
  onboarding: [
    "Train hosts on the waitlist",
    "Configure floor plan and tables",
  ],
  "monthly-report": ["Send monthly bookings & no-show report"],
  "contract-renewal": ["Discuss contract renewal and Pro upgrade"],
};

export const generateTasks = (db: Db) => {
  return Array.from(Array(150).keys()).map<Task>((id) => {
    const contact = random.arrayElement(db.contacts);
    contact.nb_tasks = (contact.nb_tasks ?? 0) + 1;
    const type = random.arrayElement(defaultTaskTypes).value;
    return {
      id,
      contact_id: contact.id,
      type,
      text: random.arrayElement(taskTexts[type] ?? ["Follow up"]),
      due_date: randomDate(
        datatype.boolean() ? new Date() : new Date(contact.first_seen),
        new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      ).toISOString(),
      done_date: undefined,
      sales_id: 0,
      created_at: randomDate(new Date(contact.first_seen)).toISOString(),
    };
  });
};
