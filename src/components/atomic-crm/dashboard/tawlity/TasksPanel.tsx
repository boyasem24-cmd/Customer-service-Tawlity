import { endOfDay, endOfWeek, isBefore } from "date-fns";
import { CheckCircle2, MessageSquareText } from "lucide-react";
import {
  useGetList,
  useGetManyAggregate,
  useLocaleState,
  useNotify,
  useTranslate,
  useUpdate,
  type Identifier,
} from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { formatRelativeDate } from "../../misc/RelativeDate";
import { useConfigurationContext } from "../../root/ConfigurationContext";
import { useGetSalesName } from "../../sales/useGetSalesName";
import { formatDateDMY } from "../../tawlity/kuwait";
import type { Contact, ContactNote, Task } from "../../types";
import { isOverdue, useOpenTasks } from "./openTasks";

export type TasksPanelScope = "open" | "overdue";

const groupOf = (task: Task) => {
  const due = new Date(task.due_date);
  if (isOverdue(task)) return "overdue";
  if (isBefore(due, endOfDay(new Date()))) return "today";
  if (isBefore(due, endOfWeek(new Date(), { weekStartsOn: 0 })))
    return "this_week";
  return "later";
};
const GROUPS = ["overdue", "today", "this_week", "later"] as const;

/**
 * Side panel listing the tasks to do, each with the latest update (the most
 * recent note) on its contact, so the next step can be decided at a glance.
 */
export const TasksPanel = ({
  scope,
  onClose,
}: {
  scope: TasksPanelScope | null;
  onClose: () => void;
}) => {
  const translate = useTranslate();
  const { data: tasks = [] } = useOpenTasks();
  const shown = scope === "overdue" ? tasks.filter(isOverdue) : tasks;
  const contactIds = [...new Set(shown.map((task) => task.contact_id))];

  // contacts_summary carries the restaurant name (company_name)
  const { data: contacts = [] } = useGetManyAggregate<Contact>(
    "contacts_summary",
    { ids: contactIds },
    { enabled: scope != null && contactIds.length > 0 },
  );
  const { data: notes = [] } = useGetList<ContactNote>(
    "contact_notes",
    {
      filter: { "contact_id@in": `(${contactIds.join(",")})` },
      sort: { field: "date", order: "DESC" },
      pagination: { page: 1, perPage: 1000 },
    },
    { enabled: scope != null && contactIds.length > 0 },
  );

  const contactById = new Map(contacts.map((c) => [c.id, c]));
  // notes are sorted newest first: the first one seen is the latest update
  const latestNoteByContact = new Map<Identifier, ContactNote>();
  notes.forEach((note) => {
    if (!latestNoteByContact.has(note.contact_id)) {
      latestNoteByContact.set(note.contact_id, note);
    }
  });

  return (
    <Sheet open={scope != null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">
            {translate(
              scope === "overdue"
                ? "crm.dashboard.tawlity.overdue_tasks"
                : "crm.dashboard.tawlity.tasks_to_do",
            )}
          </SheetTitle>
          <SheetDescription>
            {translate("crm.dashboard.tawlity.tasks_panel_hint")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-6">
          {shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {translate("crm.dashboard.tawlity.no_tasks")}
            </p>
          ) : null}
          {GROUPS.map((group) => {
            const groupTasks = shown.filter((task) => groupOf(task) === group);
            if (!groupTasks.length) return null;
            return (
              <section key={group} className="flex flex-col gap-2">
                <h3
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    group === "overdue"
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground",
                  )}
                >
                  {translate(`crm.dashboard.tawlity.due_groups.${group}`)} (
                  {groupTasks.length})
                </h3>
                {groupTasks.map((task) => (
                  <TaskUpdateCard
                    key={task.id}
                    task={task}
                    contact={contactById.get(task.contact_id)}
                    latestNote={latestNoteByContact.get(task.contact_id)}
                  />
                ))}
              </section>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const TaskUpdateCard = ({
  task,
  contact,
  latestNote,
}: {
  task: Task;
  contact?: Contact;
  latestNote?: ContactNote;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const [locale = "en"] = useLocaleState();
  const { taskTypes } = useConfigurationContext();
  const author = useGetSalesName(latestNote?.sales_id, {
    enabled: latestNote?.sales_id != null,
  });
  const [update, { isPending }] = useUpdate();
  const typeLabel =
    taskTypes.find((type) => type.value === task.type)?.label ?? task.type;
  const overdue = isOverdue(task);

  const markDone = () =>
    update(
      "tasks",
      {
        id: task.id,
        data: { done_date: new Date().toISOString() },
        previousData: task,
      },
      {
        mutationMode: "optimistic",
        onSuccess: () => notify("resources.tasks.updated", { type: "info" }),
        onError: () => notify("ra.notification.http_error", { type: "error" }),
      },
    );

  return (
    <article className="rounded-lg border bg-card p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {typeLabel}
            </span>
            <span className="font-medium">{task.text}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span
              className={cn(
                overdue && "font-semibold text-red-600 dark:text-red-400",
              )}
            >
              {translate("crm.dashboard.tawlity.due_on", {
                date: formatDateDMY(task.due_date),
              })}
            </span>
            {contact ? (
              <>
                {" · "}
                <Link
                  to={`/contacts/${contact.id}/show`}
                  className="underline hover:no-underline"
                >
                  {contact.first_name} {contact.last_name}
                </Link>
                {contact.company_id != null && contact.company_name ? (
                  <>
                    {" · "}
                    <Link
                      to={`/companies/${contact.company_id}/show`}
                      className="underline hover:no-underline"
                    >
                      {contact.company_name}
                    </Link>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 shrink-0"
          onClick={markDone}
          disabled={isPending}
        >
          <CheckCircle2 className="w-4 h-4" />
          {translate("crm.dashboard.tawlity.mark_done")}
        </Button>
      </div>
      <div className="rounded-md bg-muted/60 p-2 text-sm">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <MessageSquareText className="w-3.5 h-3.5" />
          {latestNote
            ? translate("crm.dashboard.tawlity.latest_update_by", {
                name: author,
                date: formatRelativeDate(latestNote.date, locale),
              })
            : translate("crm.dashboard.tawlity.latest_update")}
        </div>
        <p className="line-clamp-3 whitespace-pre-line">
          {latestNote?.text || translate("crm.dashboard.tawlity.no_update_yet")}
        </p>
      </div>
    </article>
  );
};
