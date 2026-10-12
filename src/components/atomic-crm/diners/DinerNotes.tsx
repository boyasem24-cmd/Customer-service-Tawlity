import { CheckCircle2, LifeBuoy, MessageSquare } from "lucide-react";
import {
  useCreate,
  useGetIdentity,
  useGetList,
  useNotify,
  useRecordContext,
  useTranslate,
  useUpdate,
} from "ra-core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { formatRelativeDate } from "../misc/RelativeDate";
import { useGetSalesName } from "../sales/useGetSalesName";
import type { Diner, DinerNote } from "../types";

/** Notes & support interactions timeline on a diner's page. */
export const DinerNotes = () => {
  const diner = useRecordContext<Diner>();
  const { data, isPending } = useGetList<DinerNote>(
    "diner_notes",
    {
      filter: { diner_id: diner?.id },
      sort: { field: "date", order: "DESC" },
      pagination: { page: 1, perPage: 100 },
    },
    { enabled: diner?.id != null },
  );
  if (!diner) return null;
  return (
    <div className="flex flex-col gap-4">
      <DinerNoteCreate diner={diner} />
      {isPending ? null : data?.length ? (
        <div className="flex flex-col divide-y">
          {data.map((note) => (
            <DinerNoteItem key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <EmptyNotes />
      )}
    </div>
  );
};

const EmptyNotes = () => {
  const translate = useTranslate();
  return (
    <p className="text-sm text-muted-foreground">
      {translate("resources.diner_notes.empty")}
    </p>
  );
};

const DinerNoteCreate = ({ diner }: { diner: Diner }) => {
  const translate = useTranslate();
  const notify = useNotify();
  const { identity } = useGetIdentity();
  const [text, setText] = useState("");
  const [kind, setKind] = useState<"note" | "support">("note");
  const [create, { isPending }] = useCreate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    create(
      "diner_notes",
      {
        data: {
          diner_id: diner.id,
          text: text.trim(),
          date: new Date().toISOString(),
          sales_id: identity?.id,
          kind,
          support_status: kind === "support" ? "open" : null,
        },
      },
      {
        onSuccess: () => {
          setText("");
          notify("resources.diner_notes.added", { type: "info" });
        },
        onError: () => notify("ra.notification.http_error", { type: "error" }),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={translate("resources.diner_notes.placeholder")}
        rows={3}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={kind === "note" ? "secondary" : "ghost"}
            onClick={() => setKind("note")}
          >
            <MessageSquare className="w-4 h-4" />
            {translate("tawlity.choices.note_kind.note")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kind === "support" ? "secondary" : "ghost"}
            onClick={() => setKind("support")}
          >
            <LifeBuoy className="w-4 h-4" />
            {translate("tawlity.choices.note_kind.support")}
          </Button>
        </div>
        <Button type="submit" disabled={isPending || !text.trim()}>
          {translate("resources.diner_notes.action.add")}
        </Button>
      </div>
    </form>
  );
};

const DinerNoteItem = ({ note }: { note: DinerNote }) => {
  const translate = useTranslate();
  const notify = useNotify();
  const salesName = useGetSalesName(note.sales_id);
  const [update, { isPending }] = useUpdate();
  const isSupport = note.kind === "support";
  const isOpen = isSupport && note.support_status === "open";

  const toggleStatus = () =>
    update(
      "diner_notes",
      {
        id: note.id,
        data: { support_status: isOpen ? "resolved" : "open" },
        previousData: note,
      },
      {
        onError: () => notify("ra.notification.http_error", { type: "error" }),
      },
    );

  return (
    <div className="py-3 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {isSupport ? (
            <LifeBuoy className="w-4 h-4" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
          <span>{salesName}</span>
          {isSupport ? (
            <span
              className={cn(
                "rounded-md border px-1.5 text-xs",
                isOpen
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-emerald-300 bg-emerald-50 text-emerald-800",
              )}
            >
              {translate(
                `tawlity.choices.support_status.${note.support_status ?? "open"}`,
              )}
            </span>
          ) : null}
        </div>
        <span className="text-muted-foreground">
          {formatRelativeDate(note.date)}
        </span>
      </div>
      <p className="text-sm whitespace-pre-line">{note.text}</p>
      {isSupport ? (
        <div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={toggleStatus}
            disabled={isPending}
          >
            <CheckCircle2 className="w-4 h-4" />
            {translate(
              isOpen
                ? "resources.diner_notes.action.resolve"
                : "resources.diner_notes.action.reopen",
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
