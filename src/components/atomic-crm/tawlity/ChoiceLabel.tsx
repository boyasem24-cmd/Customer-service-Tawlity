/* eslint-disable react-refresh/only-export-components */
import { useTranslate } from "ra-core";

import { cn } from "@/lib/utils";
import {
  accountStatusChoices,
  accountStatusColors,
  type AccountStatus,
  type Choice,
} from "./choices";

/** Returns a function translating a choice id into its label. */
export const useChoiceLabel = (choices: Choice[]) => {
  const translate = useTranslate();
  return (id: string | null | undefined) => {
    if (!id) return "";
    const choice = choices.find((c) => c.id === id);
    return choice ? translate(choice.name, { _: id }) : id;
  };
};

export const ChoiceLabels = ({
  choices,
  values,
}: {
  choices: Choice[];
  values: string[] | string | null | undefined;
}) => {
  const label = useChoiceLabel(choices);
  if (!values) return null;
  const list = Array.isArray(values) ? values : [values];
  return <>{list.map(label).join(", ")}</>;
};

export const AccountStatusBadge = ({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) => {
  const label = useChoiceLabel(accountStatusChoices);
  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        accountStatusColors[status as AccountStatus] ??
          "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label(status)}
    </span>
  );
};
