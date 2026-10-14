import { addDays, subDays } from "date-fns";
import { datatype, random } from "faker/locale/en_US";

import type { Company, Task } from "../../../types";
import type { Db } from "./types";
import { fill } from "./realisticContent";

/** Next steps a Tawlity account manager would plan, by restaurant status. */
const tasksByAccountStatus: Record<string, [string, string][]> = {
  prospect: [
    ["visit", "Visit {restaurant} before dinner service with the demo iPad"],
    ["call", "Call {first} to book a demo with the owner"],
    ["whatsapp", "WhatsApp {first} the Starter / Pro comparison"],
    ["demo", "Demo the waitlist and table map to {first}"],
    ["call", "Follow up with {first} on the pricing questions"],
  ],
  onboarding: [
    ["onboarding", "Configure the floor plan of {restaurant}"],
    ["onboarding", "Train the hosts of {restaurant} on the waitlist"],
    ["whatsapp", "Ask {first} for the missing menu photos"],
    ["call", "Confirm the go-live date with {first}"],
  ],
  live: [
    ["monthly-report", "Send the monthly bookings report to {first}"],
    [
      "contract-renewal",
      "Discuss the renewal and the Pro upgrade with {first}",
    ],
    ["visit", "Check-in visit at {restaurant}"],
    ["call", "Call {first} about the weekend no-shows"],
  ],
  paused: [["call", "Ask {first} for the reopening date of {restaurant}"]],
  churned: [["whatsapp", "Re-approach {first} with the lighter plan"]],
};

export const generateTasks = (db: Db): Task[] => {
  const tasks: Task[] = [];
  const contacts = random.arrayElements(
    db.contacts,
    Math.min(db.contacts.length, 45),
  );
  contacts.forEach((contact) => {
    const company = db.companies.find(
      (c) => c.id === contact.company_id,
    ) as Company;
    const pool =
      tasksByAccountStatus[company?.account_status ?? "prospect"] ??
      tasksByAccountStatus.prospect;
    random
      .arrayElements(pool, random.arrayElement([1, 1, 2]))
      .forEach(([type, text]) => {
        // mostly upcoming, some overdue, and about a third already done
        const due = addDays(new Date(), datatype.number({ min: -6, max: 21 }));
        const isDone = datatype.number(99) < 30;
        if (!isDone) contact.nb_tasks = (contact.nb_tasks ?? 0) + 1;
        tasks.push({
          id: tasks.length,
          contact_id: contact.id,
          type,
          text: fill(text, {
            first: contact.first_name,
            restaurant: company?.name,
          }),
          due_date: due.toISOString(),
          done_date: isDone ? subDays(due, 1).toISOString() : undefined,
          sales_id: contact.sales_id,
          created_at: subDays(due, 7).toISOString(),
        });
      });
  });
  return tasks;
};
