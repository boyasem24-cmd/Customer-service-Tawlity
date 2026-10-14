import { addDays, subDays } from "date-fns";
import { describe, expect, it } from "vitest";

import type { ContactNote, Task } from "../types";
import { buildCompany, buildContact, buildDeal } from "@/test/StoryWrapper";
import {
  getRecommendations,
  isAlreadyPlanned,
  pickTaskContact,
} from "./recommendations";

const today = new Date("2026-10-14T09:00:00.000Z");
const recent = subDays(today, 2).toISOString();

const ids = (context: Parameters<typeof getRecommendations>[0]) =>
  getRecommendations({ today, ...context }).map((rec) => rec.id);

const decisionMaker = buildContact({ id: 1, is_decision_maker: true });

const buildNote = (date: string): ContactNote => ({
  id: 1,
  contact_id: 1,
  text: "Visited, all good",
  date,
  sales_id: 0,
  status: "warm",
});

describe("getRecommendations", () => {
  it("suggests booking a demo for a visited prospect", () => {
    const result = ids({
      restaurant: buildCompany({ account_status: "prospect" }),
      deals: [buildDeal({ stage: "visited", updated_at: recent })],
      contacts: [decisionMaker],
      notes: [],
    });

    expect(result).toEqual(["stage_visited"]);
  });

  it("asks to find a contact and open a deal for an untouched prospect", () => {
    const result = ids({
      restaurant: buildCompany({ account_status: "prospect" }),
      deals: [],
      contacts: [],
      notes: [],
    });

    expect(result).toEqual(["find_contact", "qualify_and_open_deal"]);
  });

  it("flags a deal with no activity for two weeks as stalled", () => {
    const result = getRecommendations({
      today,
      restaurant: buildCompany({ account_status: "prospect" }),
      deals: [
        buildDeal({
          stage: "negotiation",
          updated_at: subDays(today, 20).toISOString(),
        }),
      ],
      contacts: [decisionMaker],
      notes: [],
    });

    expect(result[0]).toMatchObject({
      id: "revive_stalled_deal",
      args: { days: 20 },
    });
  });

  it("puts a visit within 7 days first for a Live account in Red", () => {
    const result = getRecommendations({
      today,
      restaurant: buildCompany({
        account_status: "live",
        health: "red",
        last_report_sent_at: recent,
      }),
      deals: [],
      contacts: [decisionMaker],
      notes: [buildNote(recent)],
    });

    expect(result.map((rec) => rec.id)).toEqual(["health_red"]);
    expect(result[0]).toMatchObject({ taskType: "visit", dueInDays: 7 });
  });

  it("reminds about renewal, report and silence on a quiet Live account", () => {
    const result = ids({
      restaurant: buildCompany({
        account_status: "live",
        health: "green",
        renewal_date: addDays(today, 10).toISOString(),
        last_report_sent_at: subDays(today, 50).toISOString(),
      }),
      deals: [],
      contacts: [decisionMaker],
      notes: [buildNote(subDays(today, 45).toISOString())],
    });

    expect(result).toEqual(["renewal_due", "send_monthly_report", "check_in"]);
  });

  it("points at the first missing onboarding step", () => {
    const result = ids({
      restaurant: buildCompany({
        account_status: "onboarding",
        onboarding_checklist: { menu_uploaded: true },
      }),
      deals: [],
      contacts: [decisionMaker],
      notes: [],
    });

    expect(result).toEqual(["onboarding_tables_configured"]);
  });

  it("suggests nothing for a holding group", () => {
    const result = ids({
      restaurant: buildCompany({
        is_holding: true,
        account_status: "prospect",
      }),
      deals: [],
      contacts: [],
      notes: [],
    });

    expect(result).toEqual([]);
  });
});

describe("isAlreadyPlanned", () => {
  const [recommendation] = getRecommendations({
    today,
    restaurant: buildCompany({ account_status: "prospect" }),
    deals: [buildDeal({ stage: "visited", updated_at: recent })],
    contacts: [decisionMaker],
    notes: [],
  });
  const demoIn = (days: number) =>
    ({ type: "demo", due_date: addDays(today, days).toISOString() }) as Task;

  it("is true when an open task of the same type is due soon", () => {
    expect(isAlreadyPlanned(recommendation, [demoIn(3)], today)).toBe(true);
    expect(isAlreadyPlanned(recommendation, [demoIn(-2)], today)).toBe(true);
  });

  it("ignores tasks of another type or due much later", () => {
    expect(
      isAlreadyPlanned(recommendation, [{ ...demoIn(3), type: "call" }], today),
    ).toBe(false);
    expect(isAlreadyPlanned(recommendation, [demoIn(30)], today)).toBe(false);
  });
});

describe("pickTaskContact", () => {
  it("prefers the decision maker over the first contact", () => {
    const manager = buildContact({ id: 2 });

    expect(pickTaskContact([manager, decisionMaker])).toBe(decisionMaker);
    expect(pickTaskContact([manager])).toBe(manager);
  });
});
