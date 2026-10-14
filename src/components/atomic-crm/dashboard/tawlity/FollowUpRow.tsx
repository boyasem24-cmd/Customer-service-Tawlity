import { addDays, endOfWeek, isBefore, subDays } from "date-fns";
import { useGetList, useTranslate } from "ra-core";
import { useState } from "react";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import { onboardingChecklistItems } from "../../tawlity/choices";
import { formatMoney } from "../../tawlity/kuwait";
import type { Company } from "../../types";
import { StatTile } from "./StatTile";
import { isOverdue, useOpenTasks } from "./openTasks";
import { TasksPanel, type TasksPanelScope } from "./TasksPanel";
import { useCounts } from "./useCounts";

const toDateOnly = (date: Date) => date.toISOString().split("T")[0];

const listLink = (resource: string, filter: Record<string, unknown>) =>
  `/${resource}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

/** A Live restaurant is late on its monthly report after this many days. */
const MONTHLY_REPORT_DAYS = 35;

/**
 * Follow-up KPIs for the account team: tasks to do (click for the panel with
 * the latest update on each), renewals, red accounts, late monthly reports,
 * onboarding progress, win rate and average fee.
 */
export const FollowUpRow = () => {
  const translate = useTranslate();
  const { currency, dealPipelineStatuses } = useConfigurationContext();
  const [panel, setPanel] = useState<TasksPanelScope | null>(null);
  const today = new Date();

  const { data: tasks = [], isPending: isPendingTasks } = useOpenTasks();
  const overdue = tasks.filter(isOverdue).length;
  const dueThisWeek = tasks.filter(
    (task) =>
      !isOverdue(task) &&
      isBefore(new Date(task.due_date), endOfWeek(today, { weekStartsOn: 0 })),
  ).length;

  const { data: live = [], isPending: isPendingLive } = useGetList<Company>(
    "companies",
    {
      filter: { account_status: "live", is_holding: false },
      pagination: { page: 1, perPage: 1000 },
    },
  );
  const { data: onboarding = [], isPending: isPendingOnboarding } =
    useGetList<Company>("companies", {
      filter: { account_status: "onboarding", is_holding: false },
      pagination: { page: 1, perPage: 1000 },
    });

  const renewalFilter = {
    account_status: "live",
    "renewal_date@gte": toDateOnly(today),
    "renewal_date@lte": toDateOnly(addDays(today, 30)),
  };
  const { counts, isPending: isPendingCounts } = useCounts("deals", {
    won: { "stage@in": `(${dealPipelineStatuses.join(",")})` },
    lost: { stage: "lost" },
  });
  const { counts: companyCounts, isPending: isPendingCompanies } = useCounts(
    "companies",
    { renewals: renewalFilter, red: { account_status: "live", health: "red" } },
  );

  const reportCutoff = toDateOnly(subDays(today, MONTHLY_REPORT_DAYS));
  const lateReports = live.filter(
    (r) => !r.last_report_sent_at || r.last_report_sent_at < reportCutoff,
  ).length;

  const onboardingProgress = onboarding.length
    ? Math.round(
        (onboarding.reduce(
          (sum, r) =>
            sum +
            onboardingChecklistItems.filter(
              (item) => r.onboarding_checklist?.[item],
            ).length,
          0,
        ) /
          (onboarding.length * onboardingChecklistItems.length)) *
          100,
      )
    : null;

  const decided = counts.won + counts.lost;
  const winRate = decided ? Math.round((counts.won / decided) * 100) : null;
  const avgFee = live.length
    ? live.reduce((sum, r) => sum + Number(r.monthly_fee ?? 0), 0) / live.length
    : 0;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label={translate("crm.dashboard.tawlity.tasks_to_do")}
          value={tasks.length}
          hint={translate("crm.dashboard.tawlity.due_this_week", {
            count: dueThisWeek,
          })}
          isPending={isPendingTasks}
          onClick={() => setPanel("open")}
        />
        <StatTile
          label={translate("crm.dashboard.tawlity.overdue_tasks")}
          value={overdue}
          hint={translate("crm.dashboard.tawlity.click_for_updates")}
          tone={overdue > 0 ? "alert" : undefined}
          isPending={isPendingTasks}
          onClick={() => setPanel("overdue")}
        />
        <StatTile
          label={translate("crm.dashboard.tawlity.renewals_30_days")}
          value={companyCounts.renewals}
          isPending={isPendingCompanies}
          to={listLink("companies", renewalFilter)}
        />
        <StatTile
          label={translate("crm.dashboard.tawlity.red_accounts")}
          value={companyCounts.red}
          tone={companyCounts.red > 0 ? "alert" : undefined}
          isPending={isPendingCompanies}
          to={listLink("companies", { account_status: "live", health: "red" })}
        />
        <StatTile
          label={translate("crm.dashboard.tawlity.late_reports")}
          value={lateReports}
          hint={translate("crm.dashboard.tawlity.late_reports_hint", {
            days: MONTHLY_REPORT_DAYS,
          })}
          isPending={isPendingLive}
        />
        <StatTile
          label={translate("crm.dashboard.tawlity.onboarding_progress")}
          value={onboardingProgress == null ? "—" : `${onboardingProgress}%`}
          hint={translate("crm.dashboard.tawlity.onboarding_restaurants", {
            smart_count: onboarding.length,
          })}
          isPending={isPendingOnboarding}
          to={listLink("companies", { account_status: "onboarding" })}
        />
        <StatTile
          label={translate("crm.dashboard.tawlity.win_rate")}
          value={winRate == null ? "—" : `${winRate}%`}
          hint={translate("crm.dashboard.tawlity.win_rate_hint", {
            won: counts.won,
            lost: counts.lost,
          })}
          isPending={isPendingCounts}
        />
        <StatTile
          label={translate("crm.dashboard.tawlity.avg_fee")}
          value={formatMoney(avgFee, currency)}
          isPending={isPendingLive}
        />
      </div>
      <TasksPanel scope={panel} onClose={() => setPanel(null)} />
    </>
  );
};
