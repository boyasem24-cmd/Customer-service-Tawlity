import { startOfMonth } from "date-fns";
import { Megaphone, Smartphone, Trophy } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";

import {
  acquisitionSourceChoices,
  formatPercent,
  getDinerName,
  NO_SHOW_ALERT_THRESHOLD,
  platformChoices,
} from "../../diners/dinerModel";
import { DinerStatusBadge } from "../../diners/DinerStatusBadge";
import { NoShowRate } from "../../diners/NoShowRate";
import { useChoiceLabel } from "../../tawlity/ChoiceLabel";
import type { Choice } from "../../tawlity/choices";
import type { Diner } from "../../types";
import { BarList } from "./BarList";
import { StatTile } from "./StatTile";
import { useCounts } from "./useCounts";

const listLink = (resource: string, filter: Record<string, unknown>) =>
  `/${resource}?filter=${encodeURIComponent(JSON.stringify(filter))}`;

export const DinersDashboard = () => (
  <div className="flex flex-col gap-6">
    <DinerKpis />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 flex flex-col gap-6">
        <SplitCard
          icon={<Smartphone className="w-6 h-6" />}
          title="crm.dashboard.tawlity.by_platform"
          field="signup_platform"
          choices={platformChoices}
        />
        <SplitCard
          icon={<Megaphone className="w-6 h-6" />}
          title="crm.dashboard.tawlity.by_acquisition_source"
          field="acquisition_source"
          choices={acquisitionSourceChoices}
        />
      </div>
      <div className="lg:col-span-6">
        <TopDiners />
      </div>
    </div>
  </div>
);

const DinerKpis = () => {
  const translate = useTranslate();
  const monthStart = startOfMonth(new Date()).toISOString().split("T")[0];
  const { counts, isPending } = useCounts("diners", {
    total: {},
    new: { "signup_date@gte": monthStart },
    active: { status: "active" },
    inactive: { status: "inactive" },
  });
  const { counts: support, isPending: isPendingSupport } = useCounts(
    "diner_notes",
    { open: { kind: "support", support_status: "open" } },
  );
  // The overall no-show rate needs every diner's counters
  const { data: diners, isPending: isPendingRate } = useGetList<Diner>(
    "diners",
    { pagination: { page: 1, perPage: 10000 } },
  );
  const totals = (diners ?? []).reduce(
    (acc, diner) => ({
      reservations: acc.reservations + (diner.total_reservations ?? 0),
      noShows: acc.noShows + (diner.total_no_shows ?? 0),
    }),
    { reservations: 0, noShows: 0 },
  );
  const noShowRate = totals.reservations
    ? totals.noShows / totals.reservations
    : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatTile
        label={translate("crm.dashboard.tawlity.total_diners")}
        value={counts.total}
        isPending={isPending}
        to="/diners"
      />
      <StatTile
        label={translate("crm.dashboard.tawlity.new_this_month")}
        value={counts.new}
        isPending={isPending}
        to={listLink("diners", { "signup_date@gte": monthStart })}
      />
      <StatTile
        label={translate("tawlity.choices.diner_status.active")}
        value={counts.active}
        isPending={isPending}
        to={listLink("diners", { status: "active" })}
      />
      <StatTile
        label={translate("tawlity.choices.diner_status.inactive")}
        value={counts.inactive}
        isPending={isPending}
        to={listLink("diners", { status: "inactive" })}
      />
      <StatTile
        label={translate("crm.dashboard.tawlity.no_show_rate")}
        value={formatPercent(noShowRate)}
        hint={translate("crm.dashboard.tawlity.no_shows_of_reservations", {
          no_shows: totals.noShows,
          reservations: totals.reservations,
        })}
        tone={
          noShowRate != null && noShowRate > NO_SHOW_ALERT_THRESHOLD
            ? "alert"
            : undefined
        }
        isPending={isPendingRate}
      />
      <StatTile
        label={translate("crm.dashboard.tawlity.open_support")}
        value={support.open}
        isPending={isPendingSupport}
      />
    </div>
  );
};

const SplitCard = ({
  icon,
  title,
  field,
  choices,
}: {
  icon: React.ReactNode;
  title: string;
  field: string;
  choices: Choice[];
}) => {
  const translate = useTranslate();
  const label = useChoiceLabel(choices);
  const { counts } = useCounts(
    "diners",
    Object.fromEntries(
      choices.map((choice) => [choice.id, { [field]: choice.id }]),
    ),
  );
  const items = choices
    .map((choice) => ({
      key: choice.id,
      label: label(choice.id),
      value: counts[choice.id] ?? 0,
      to: listLink("diners", { [field]: choice.id }),
    }))
    .sort((a, b) => b.value - a.value);
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate(title)}
        </h2>
      </div>
      <Card className="p-4">
        <BarList items={items} />
      </Card>
    </div>
  );
};

const TopDiners = () => {
  const translate = useTranslate();
  const { data } = useGetList<Diner>("diners", {
    pagination: { page: 1, perPage: 10 },
    sort: { field: "total_reservations", order: "DESC" },
  });
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-6 h-6 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.dashboard.tawlity.top_diners")}
        </h2>
      </div>
      <Card className="p-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-start">
              <th className="font-normal px-2 py-1">#</th>
              <th className="font-normal px-2 py-1">
                {translate("resources.diners.fields.name")}
              </th>
              <th className="font-normal px-2 py-1 text-end">
                {translate("resources.diners.fields.total_reservations")}
              </th>
              <th className="font-normal px-2 py-1 text-end">
                {translate("resources.diners.fields.no_show_rate")}
              </th>
              <th className="font-normal px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {data?.map((diner, index) => (
              <tr key={diner.id} className="hover:bg-muted">
                <td className="px-2 py-1.5 text-muted-foreground tabular-nums">
                  {index + 1}
                </td>
                <td className="px-2 py-1.5">
                  <Link
                    to={`/diners/${diner.id}/show`}
                    className="hover:underline"
                  >
                    {getDinerName(diner)}
                  </Link>
                </td>
                <td className="px-2 py-1.5 text-end tabular-nums">
                  {diner.total_reservations}
                </td>
                <td className="px-2 py-1.5 text-end">
                  <NoShowRate diner={diner} />
                </td>
                <td className="px-2 py-1.5 text-end">
                  <DinerStatusBadge status={diner.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
