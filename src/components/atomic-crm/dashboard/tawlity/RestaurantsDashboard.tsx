import { addDays, startOfMonth } from "date-fns";
import { AlertTriangle, MapPin } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import { AccountStatusBadge, useChoiceLabel } from "../../tawlity/ChoiceLabel";
import {
  accountStatusChoices,
  governorateChoices,
} from "../../tawlity/choices";
import { HealthDot } from "../../tawlity/HealthDot";
import { formatDateDMY, formatMoney } from "../../tawlity/kuwait";
import type { Company, Deal } from "../../types";
import { FollowUpRow } from "./FollowUpRow";
import { BarList } from "./BarList";
import { StatTile } from "./StatTile";
import { useCounts } from "./useCounts";

const listLink = (resource: string, filter: Record<string, unknown>) =>
  `/${resource}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

const toDateOnly = (date: Date) => date.toISOString().split("T")[0];

export const RestaurantsDashboard = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-6">
      <KpiSection title={translate("crm.dashboard.tawlity.section_accounts")}>
        <AccountStatusRow />
      </KpiSection>
      <KpiSection title={translate("crm.dashboard.tawlity.section_revenue")}>
        <RevenueRow />
      </KpiSection>
      <KpiSection title={translate("crm.dashboard.tawlity.section_follow_up")}>
        <FollowUpRow />
      </KpiSection>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttentionList />
        <RestaurantsByGovernorate />
      </div>
    </div>
  );
};

const KpiSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-2">
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </h2>
    {children}
  </section>
);

const SectionTitle = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 mb-2">
    <span className="text-muted-foreground">{icon}</span>
    <h2 className="text-xl font-semibold text-muted-foreground">{children}</h2>
  </div>
);

const AccountStatusRow = () => {
  const statusLabel = useChoiceLabel(accountStatusChoices);
  const { counts, isPending } = useCounts(
    "companies",
    Object.fromEntries(
      accountStatusChoices.map((choice) => [
        choice.id,
        { account_status: choice.id, is_holding: false },
      ]),
    ),
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {accountStatusChoices.map((choice) => (
        <StatTile
          key={choice.id}
          label={statusLabel(choice.id)}
          value={counts[choice.id]}
          isPending={isPending}
          to={listLink("companies", { account_status: choice.id })}
        />
      ))}
    </div>
  );
};

const RevenueRow = () => {
  const translate = useTranslate();
  const { dealStages, dealPipelineStatuses, currency } =
    useConfigurationContext();
  const monthStart = startOfMonth(new Date()).toISOString();
  const openStages = dealStages
    .map((stage) => stage.value)
    .filter(
      (stage) => stage !== "lost" && !dealPipelineStatuses.includes(stage),
    );

  const { data: openDeals, isPending: isPendingOpen } = useGetList<Deal>(
    "deals",
    {
      filter: {
        "stage@in": `(${openStages.join(",")})`,
        "archived_at@is": null,
      },
      pagination: { page: 1, perPage: 1000 },
    },
  );
  const { data: live, isPending: isPendingLive } = useGetList<Company>(
    "companies",
    {
      filter: { account_status: "live", is_holding: false },
      pagination: { page: 1, perPage: 1000 },
    },
  );
  const { counts, isPending: isPendingCounts } = useCounts("deals", {
    won: {
      "stage@in": `(${dealPipelineStatuses.join(",")})`,
      "updated_at@gte": monthStart,
    },
    lost: { stage: "lost", "updated_at@gte": monthStart },
  });

  const pipelineValue = (openDeals ?? []).reduce(
    (sum, deal) => sum + Number(deal.amount ?? 0),
    0,
  );
  const mrr = (live ?? []).reduce(
    (sum, restaurant) => sum + Number(restaurant.monthly_fee ?? 0),
    0,
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatTile
        label={translate("crm.dashboard.tawlity.pipeline_value")}
        value={formatMoney(pipelineValue, currency)}
        hint={translate("crm.dashboard.tawlity.open_deals", {
          smart_count: openDeals?.length ?? 0,
        })}
        isPending={isPendingOpen}
        to="/deals"
      />
      <StatTile
        label={translate("crm.dashboard.tawlity.mrr")}
        value={formatMoney(mrr, currency)}
        hint={translate("crm.dashboard.tawlity.live_restaurants", {
          smart_count: live?.length ?? 0,
        })}
        isPending={isPendingLive}
      />
      <StatTile
        label={translate("crm.dashboard.tawlity.won_this_month")}
        value={counts.won}
        isPending={isPendingCounts}
      />
      <StatTile
        label={translate("crm.dashboard.tawlity.lost_this_month")}
        value={counts.lost}
        isPending={isPendingCounts}
      />
    </div>
  );
};

const RestaurantsByGovernorate = () => {
  const translate = useTranslate();
  const label = useChoiceLabel(governorateChoices);
  const { counts } = useCounts(
    "companies",
    Object.fromEntries(
      governorateChoices.map((choice) => [
        choice.id,
        { governorate: choice.id, is_holding: false },
      ]),
    ),
  );
  const items = governorateChoices
    .map((choice) => ({
      key: choice.id,
      label: label(choice.id),
      value: counts[choice.id] ?? 0,
      to: listLink("companies", { governorate: choice.id }),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <SectionTitle icon={<MapPin className="w-6 h-6" />}>
        {translate("crm.dashboard.tawlity.by_governorate")}
      </SectionTitle>
      <Card className="p-4">
        <BarList items={items} />
      </Card>
    </div>
  );
};

/** Live restaurants that need attention: Red health or renewal within 30 days. */
const AttentionList = () => {
  const translate = useTranslate();
  const { currency } = useConfigurationContext();
  const today = toDateOnly(new Date());
  const in30Days = toDateOnly(addDays(new Date(), 30));
  const { data: red } = useGetList<Company>("companies", {
    filter: { account_status: "live", health: "red" },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "name", order: "ASC" },
  });
  const { data: renewals } = useGetList<Company>("companies", {
    filter: {
      account_status: "live",
      "renewal_date@gte": today,
      "renewal_date@lte": in30Days,
    },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "renewal_date", order: "ASC" },
  });
  const byId = new Map<Company["id"], Company>();
  [...(red ?? []), ...(renewals ?? [])].forEach((r) => byId.set(r.id, r));
  const restaurants = [...byId.values()];

  return (
    <div>
      <SectionTitle icon={<AlertTriangle className="w-6 h-6" />}>
        {translate("crm.dashboard.tawlity.needs_attention")}
      </SectionTitle>
      <Card className="p-2">
        {restaurants.length ? (
          <div className="flex flex-col">
            {restaurants.map((restaurant) => {
              const renewsSoon =
                restaurant.renewal_date &&
                restaurant.renewal_date >= today &&
                restaurant.renewal_date <= in30Days;
              return (
                <Link
                  key={restaurant.id}
                  to={`/companies/${restaurant.id}/show/account`}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted text-sm"
                >
                  <span className="font-medium flex-1 min-w-0 truncate">
                    {restaurant.name}
                  </span>
                  {restaurant.health === "red" ? (
                    <HealthDot
                      health="red"
                      note={restaurant.health_note}
                      showLabel
                    />
                  ) : null}
                  {renewsSoon ? (
                    <span className="text-xs rounded-md border px-1.5 py-0.5">
                      {translate("crm.dashboard.tawlity.renews_on", {
                        date: formatDateDMY(restaurant.renewal_date),
                      })}
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatMoney(restaurant.monthly_fee, currency)}
                  </span>
                  <AccountStatusBadge status={restaurant.account_status} />
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground p-2">
            {translate("crm.dashboard.tawlity.nothing_needs_attention")}
          </p>
        )}
      </Card>
    </div>
  );
};
