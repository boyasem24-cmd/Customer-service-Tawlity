import { differenceInCalendarDays } from "date-fns";

import type { Company, Contact, ContactNote, Deal, Task } from "../types";
import { onboardingChecklistItems } from "./choices";

/**
 * The account playbook: from what the CRM knows about a restaurant, suggest
 * the next actions to win it (acquisition) or to keep it (retention).
 * Pure functions, so the rules are easy to read, test and change.
 */

export type RecommendationPriority = "high" | "medium" | "low";
export type RecommendationGoal = "acquisition" | "retention";

export type Recommendation = {
  /** Stable id, also the translation key under tawlity.recommendations */
  id: string;
  goal: RecommendationGoal;
  priority: RecommendationPriority;
  /** Values interpolated in the title and reason texts */
  args?: Record<string, string | number>;
  /** Task created by "Create task": its type and due delay in days */
  taskType: string;
  dueInDays: number;
};

export type RecommendationContext = {
  restaurant: Company;
  deals: Deal[];
  contacts: Contact[];
  /** Notes on the restaurant's contacts, any order */
  notes: ContactNote[];
  today?: Date;
};

/** An open deal untouched for this many days is considered stalled. */
export const STALE_DEAL_DAYS = 14;
/** A Live account without a note for this many days needs a check-in. */
export const SILENT_ACCOUNT_DAYS = 30;
/** Live accounts expect a monthly report at least this often. */
export const REPORT_DAYS = 35;
/** Renewals are prepared this many days ahead. */
export const RENEWAL_NOTICE_DAYS = 45;

const OPEN_STAGES = ["lead", "visited", "demo-done", "trial", "negotiation"];
const COMPETITOR_SYSTEMS = ["sevenrooms", "eat_app"];

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const daysSince = (date: string | null | undefined, today: Date) =>
  date ? differenceInCalendarDays(today, new Date(date)) : null;

const daysUntil = (date: string | null | undefined, today: Date) =>
  date ? differenceInCalendarDays(new Date(date), today) : null;

/** The open deal the team is working on: the most recently updated one. */
const currentOpenDeal = (deals: Deal[]) =>
  deals
    .filter((deal) => !deal.archived_at && OPEN_STAGES.includes(deal.stage))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];

const acquisitionRecommendations = (
  context: RecommendationContext,
  today: Date,
): Recommendation[] => {
  const { restaurant, deals, contacts } = context;
  const recommendations: Recommendation[] = [];
  const status = restaurant.account_status ?? "prospect";
  if (status !== "prospect") return recommendations;

  if (contacts.length === 0) {
    recommendations.push({
      id: "find_contact",
      goal: "acquisition",
      priority: "high",
      taskType: "visit",
      dueInDays: 3,
    });
  } else if (!contacts.some((contact) => contact.is_decision_maker)) {
    recommendations.push({
      id: "find_decision_maker",
      goal: "acquisition",
      priority: "medium",
      taskType: "call",
      dueInDays: 5,
    });
  }

  const deal = currentOpenDeal(deals);
  if (!deal) {
    recommendations.push({
      id: "qualify_and_open_deal",
      goal: "acquisition",
      priority: "medium",
      taskType: "visit",
      dueInDays: 7,
    });
  } else {
    const idle = daysSince(deal.updated_at, today) ?? 0;
    if (idle >= STALE_DEAL_DAYS) {
      recommendations.push({
        id: "revive_stalled_deal",
        goal: "acquisition",
        priority: "high",
        args: { days: idle },
        taskType: "call",
        dueInDays: 1,
      });
    }
    const byStage: Record<string, Omit<Recommendation, "goal" | "id">> = {
      lead: { priority: "medium", taskType: "visit", dueInDays: 3 },
      visited: { priority: "high", taskType: "demo", dueInDays: 5 },
      "demo-done": { priority: "high", taskType: "whatsapp", dueInDays: 2 },
      trial: { priority: "high", taskType: "call", dueInDays: 3 },
      negotiation: { priority: "high", taskType: "call", dueInDays: 2 },
    };
    const next = byStage[deal.stage];
    if (next) {
      recommendations.push({
        id: `stage_${deal.stage.replace("-", "_")}`,
        goal: "acquisition",
        ...next,
      });
    }
  }

  if (
    restaurant.booking_system &&
    COMPETITOR_SYSTEMS.includes(restaurant.booking_system)
  ) {
    recommendations.push({
      id: "competitor_comparison",
      goal: "acquisition",
      priority: "low",
      taskType: "demo",
      dueInDays: 7,
    });
  }
  if ((restaurant.nb_branches ?? 1) > 1) {
    recommendations.push({
      id: "pitch_multi_branch",
      goal: "acquisition",
      priority: "low",
      args: { branches: restaurant.nb_branches ?? 1 },
      taskType: "demo",
      dueInDays: 10,
    });
  }
  return recommendations;
};

const retentionRecommendations = (
  context: RecommendationContext,
  today: Date,
): Recommendation[] => {
  const { restaurant, notes } = context;
  const recommendations: Recommendation[] = [];
  const status = restaurant.account_status;

  if (status === "onboarding") {
    const missing = onboardingChecklistItems.find(
      (item) => !restaurant.onboarding_checklist?.[item],
    );
    if (missing) {
      recommendations.push({
        id: `onboarding_${missing}`,
        goal: "retention",
        priority: "high",
        taskType: "onboarding",
        dueInDays: 3,
      });
    }
  }

  if (status === "live") {
    if (restaurant.health === "red") {
      recommendations.push({
        id: "health_red",
        goal: "retention",
        priority: "high",
        taskType: "visit",
        dueInDays: 7,
      });
    } else if (restaurant.health === "amber") {
      recommendations.push({
        id: "health_amber",
        goal: "retention",
        priority: "medium",
        taskType: "call",
        dueInDays: 7,
      });
    } else if (!restaurant.health) {
      recommendations.push({
        id: "health_missing",
        goal: "retention",
        priority: "low",
        taskType: "call",
        dueInDays: 14,
      });
    }

    const renewal = daysUntil(restaurant.renewal_date, today);
    if (renewal != null && renewal >= 0 && renewal <= RENEWAL_NOTICE_DAYS) {
      recommendations.push({
        id: "renewal_due",
        goal: "retention",
        priority: renewal <= 15 ? "high" : "medium",
        args: { days: renewal },
        taskType: "contract-renewal",
        dueInDays: Math.max(1, Math.min(7, renewal - 7)),
      });
    }

    const sinceReport = daysSince(restaurant.last_report_sent_at, today);
    if (sinceReport == null || sinceReport > REPORT_DAYS) {
      recommendations.push({
        id: "send_monthly_report",
        goal: "retention",
        priority: "medium",
        taskType: "monthly-report",
        dueInDays: 2,
      });
    }

    const lastNote = notes.reduce<string | null>(
      (latest, note) => (!latest || note.date > latest ? note.date : latest),
      null,
    );
    const silence = daysSince(lastNote, today);
    if (silence == null || silence > SILENT_ACCOUNT_DAYS) {
      recommendations.push({
        id: "check_in",
        goal: "retention",
        priority: "medium",
        taskType: "visit",
        dueInDays: 7,
      });
    }

    if (
      (restaurant.plan === "starter" || restaurant.plan === "free_trial") &&
      (restaurant.nb_branches ?? 1) > 1
    ) {
      recommendations.push({
        id: "upsell_pro",
        goal: "retention",
        priority: "low",
        args: { branches: restaurant.nb_branches ?? 1 },
        taskType: "call",
        dueInDays: 14,
      });
    }
  }

  if (status === "paused") {
    recommendations.push({
      id: "paused_reopening",
      goal: "retention",
      priority: "medium",
      taskType: "call",
      dueInDays: 7,
    });
  }
  if (status === "churned") {
    recommendations.push({
      id: "churned_win_back",
      goal: "retention",
      priority: "low",
      taskType: "whatsapp",
      dueInDays: 30,
    });
  }
  return recommendations;
};

/** Every recommendation for a restaurant, most urgent first. */
export const getRecommendations = (
  context: RecommendationContext,
): Recommendation[] => {
  const today = context.today ?? new Date();
  if (context.restaurant.is_holding) return [];
  return [
    ...acquisitionRecommendations(context, today),
    ...retentionRecommendations(context, today),
  ].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
};

/** Slack after the suggested due date in which an open task still counts. */
export const PLANNED_WINDOW_DAYS = 7;

/**
 * Whether an open task of this type, due within the recommendation's window
 * (or already overdue), covers it: the panel then shows "already planned"
 * instead of suggesting a duplicate task.
 */
export const isAlreadyPlanned = (
  recommendation: Recommendation,
  openTasks: Task[],
  today: Date = new Date(),
) =>
  openTasks.some(
    (task) =>
      task.type === recommendation.taskType &&
      (daysUntil(task.due_date, today) ?? 0) <=
        recommendation.dueInDays + PLANNED_WINDOW_DAYS,
  );

/** Who the task goes to: the decision maker, else the first contact. */
export const pickTaskContact = (contacts: Contact[]) =>
  contacts.find((contact) => contact.is_decision_maker) ?? contacts[0];
