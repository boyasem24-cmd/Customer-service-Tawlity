import { addDays } from "date-fns";
import { CalendarCheck, Lightbulb, Plus } from "lucide-react";
import {
  useCreate,
  useGetIdentity,
  useGetList,
  useNotify,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  getRecommendations,
  isAlreadyPlanned,
  pickTaskContact,
  type Recommendation,
  type RecommendationPriority,
} from "../tawlity/recommendations";
import type { Company, Contact, ContactNote, Deal, Task } from "../types";

const priorityStyles: Record<RecommendationPriority, string> = {
  high: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
  medium:
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  low: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
};

/**
 * "Recommended next actions" on a restaurant page: the playbook applied to
 * this account (see tawlity/recommendations.ts), each action one click away
 * from becoming a task on the right contact.
 */
export const RecommendationsPanel = () => {
  const restaurant = useRecordContext<Company>();
  const translate = useTranslate();
  const enabled = restaurant?.id != null;

  const { data: deals = [], isPending: isPendingDeals } = useGetList<Deal>(
    "deals",
    {
      filter: { company_id: restaurant?.id },
      pagination: { page: 1, perPage: 100 },
    },
    { enabled },
  );
  const { data: contacts = [], isPending: isPendingContacts } =
    useGetList<Contact>(
      "contacts_summary",
      {
        filter: { company_id: restaurant?.id },
        pagination: { page: 1, perPage: 100 },
      },
      { enabled },
    );
  const contactIds = contacts.map((contact) => contact.id).join(",");
  const { data: notes = [] } = useGetList<ContactNote>(
    "contact_notes",
    {
      filter: { "contact_id@in": `(${contactIds})` },
      sort: { field: "date", order: "DESC" },
      pagination: { page: 1, perPage: 1 },
    },
    { enabled: contactIds.length > 0 },
  );
  const { data: tasks = [] } = useGetList<Task>(
    "tasks",
    {
      filter: { "contact_id@in": `(${contactIds})`, "done_date@is": null },
      pagination: { page: 1, perPage: 200 },
    },
    { enabled: contactIds.length > 0 },
  );

  if (!restaurant || restaurant.is_holding) return null;
  if (isPendingDeals || isPendingContacts) return null;

  const openTasks = tasks.filter((task) => task.done_date == null);
  const recommendations = getRecommendations({
    restaurant,
    deals,
    contacts,
    notes,
  });

  return (
    <Card className="py-4">
      <CardContent className="px-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-highlight" />
          <h6 className="text-lg font-semibold">
            {translate("tawlity.recommendations.panel.title")}
          </h6>
        </div>
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {translate("tawlity.recommendations.panel.empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recommendations.map((recommendation) => (
              <RecommendationItem
                key={recommendation.id}
                recommendation={recommendation}
                contact={pickTaskContact(contacts)}
                planned={isAlreadyPlanned(recommendation, openTasks)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const RecommendationItem = ({
  recommendation,
  contact,
  planned,
}: {
  recommendation: Recommendation;
  contact?: Contact;
  planned: boolean;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const { identity } = useGetIdentity();
  const [create, { isPending }] = useCreate();
  const key = `tawlity.recommendations.${recommendation.id}`;
  const args = recommendation.args ?? {};

  const createTask = () => {
    if (!contact) return;
    create(
      "tasks",
      {
        data: {
          contact_id: contact.id,
          type: recommendation.taskType,
          text: translate(`${key}.task`, {
            ...args,
            first: contact.first_name,
          }),
          due_date: addDays(new Date(), recommendation.dueInDays).toISOString(),
          sales_id: identity?.id,
        },
      },
      {
        onSuccess: () =>
          notify("tawlity.recommendations.panel.task_created", {
            type: "info",
            messageArgs: { name: contact.first_name },
          }),
        onError: () => notify("ra.notification.http_error", { type: "error" }),
      },
    );
  };

  return (
    <li className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-xs font-medium",
              priorityStyles[recommendation.priority],
            )}
          >
            {translate(
              `tawlity.recommendations.priority.${recommendation.priority}`,
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {translate(`tawlity.recommendations.goal.${recommendation.goal}`)}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium">
          {translate(`${key}.title`, args)}
        </p>
        <p className="text-sm text-muted-foreground">
          {translate(`${key}.reason`, args)}
        </p>
      </div>
      {planned ? (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 shrink-0">
          <CalendarCheck className="w-4 h-4" />
          {translate("tawlity.recommendations.panel.planned")}
        </span>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={createTask}
          disabled={!contact || isPending}
          title={
            contact
              ? undefined
              : translate("tawlity.recommendations.panel.needs_contact")
          }
        >
          <Plus className="w-4 h-4" />
          {translate("tawlity.recommendations.panel.create_task")}
        </Button>
      )}
    </li>
  );
};
