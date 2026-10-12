import { cn } from "@/lib/utils";

import { useChoiceLabel } from "../tawlity/ChoiceLabel";
import { dinerStatusChoices, dinerStatusColors } from "./dinerModel";

export const DinerStatusBadge = ({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) => {
  const label = useChoiceLabel(dinerStatusChoices);
  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        dinerStatusColors[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label(status)}
    </span>
  );
};
