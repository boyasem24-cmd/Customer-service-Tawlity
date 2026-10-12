import { random } from "faker/locale/en_US";

import { formatKWD } from "../../../tawlity/kuwait";
import type { DealNote } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";
import { dealNotesByStage, fill } from "./realisticContent";

const planNames: Record<string, string> = {
  free_trial: "Free trial",
  starter: "Starter",
  pro: "Pro",
  group_enterprise: "Group",
};

/** One or two notes per deal, matching its pipeline stage. */
export const generateDealNotes = (db: Db): DealNote[] => {
  const notes: DealNote[] = [];
  db.deals.forEach((deal) => {
    const pool = dealNotesByStage[deal.stage] ?? [];
    random
      .arrayElements(pool, random.arrayElement([1, 1, 2]))
      .forEach((text) => {
        notes.push({
          id: notes.length,
          deal_id: deal.id,
          text: fill(text, {
            plan: planNames[deal.plan ?? ""] ?? "",
            fee: formatKWD(deal.amount),
            branches: deal.nb_branches_covered ?? 1,
          }),
          date: randomDate(new Date(deal.created_at)).toISOString(),
          sales_id: deal.sales_id,
        });
      });
  });
  return notes;
};
