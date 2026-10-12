import { add } from "date-fns";
import { datatype, lorem, random } from "faker/locale/en_US";

import { defaultDealStages } from "../../../root/defaultConfiguration";
import { lostReasonChoices } from "../../../tawlity/choices";
import type { Company, Deal } from "../../../types";
import type { Db } from "./types";
import { randomDate, weightedArrayElement } from "./utils";

const planFees: Record<string, number> = {
  free_trial: 0,
  starter: 25,
  pro: 45,
  group_enterprise: 120,
};

const planNames: Record<string, string> = {
  free_trial: "Free trial",
  starter: "Starter",
  pro: "Pro",
  group_enterprise: "Group",
};

/** Picks a pipeline stage consistent with the restaurant's account status. */
const stageForCompany = (company: Company): string => {
  switch (company.account_status) {
    case "live":
      return weightedArrayElement(["live", "signed"], [4, 1]);
    case "onboarding":
      return weightedArrayElement(["trial", "signed"], [2, 3]);
    case "paused":
    case "churned":
      return weightedArrayElement(["lost", "live"], [3, 1]);
    default:
      return weightedArrayElement(
        ["lead", "visited", "demo-done", "trial", "negotiation", "lost"],
        [4, 4, 3, 2, 3, 2],
      );
  }
};

export const generateDeals = (db: Db): Deal[] => {
  const candidates = db.companies.filter((c) => !c.is_holding);
  const holdings = db.companies.filter((c) => c.is_holding);

  const deals: Deal[] = [...candidates, ...holdings].map((company, id) => {
    company.nb_deals = (company.nb_deals ?? 0) + 1;
    const contacts = random.arrayElements(
      db.contacts.filter((contact) => contact.company_id === company.id),
      datatype.number({ min: 1, max: 2 }),
    );
    const stage = stageForCompany(company);
    const plan = company.is_holding
      ? "group_enterprise"
      : (company.plan ??
        weightedArrayElement(["starter", "pro", "free_trial"], [5, 4, 1]));
    const branches = company.is_holding
      ? (company.nb_brands ?? 3) * 2
      : Math.max(1, company.nb_branches ?? 1);
    const amount =
      company.monthly_fee ??
      planFees[plan] * (plan === "group_enterprise" ? 1 : branches);
    const created_at = randomDate(
      new Date(Date.now() - 200 * 24 * 3600 * 1000),
    ).toISOString();
    const expected_closing_date = randomDate(
      new Date(),
      add(new Date(), { months: 3 }),
    )
      .toISOString()
      .split("T")[0];

    return {
      id,
      name: `${planNames[plan]} plan`,
      company_id: company.id,
      contact_ids: contacts.map((contact) => contact.id),
      category: "other",
      stage,
      description: lorem.sentence(),
      amount,
      created_at,
      updated_at: randomDate(new Date(created_at)).toISOString(),
      expected_closing_date,
      sales_id: company.sales_id!,
      index: 0,
      plan,
      nb_branches_covered: branches,
      lost_reason:
        stage === "lost" ? random.arrayElement(lostReasonChoices).id : null,
    };
  });
  // compute index based on stage
  defaultDealStages.forEach((stage) => {
    deals
      .filter((deal) => deal.stage === stage.value)
      .forEach((deal, index) => {
        deals[deal.id as number].index = index;
      });
  });
  return deals;
};
