import { cn } from "@/lib/utils";

import { useChoiceLabel } from "./ChoiceLabel";
import { healthChoices, healthColors, type Health } from "./choices";

/** Coloured dot for the Green / Amber / Red account health score. */
export const HealthDot = ({
  health,
  note,
  showLabel = false,
  className,
}: {
  health?: string | null;
  note?: string | null;
  showLabel?: boolean;
  className?: string;
}) => {
  const label = useChoiceLabel(healthChoices);
  if (!health) return null;
  const text = label(health);
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs", className)}
      title={note ? `${text}: ${note}` : text}
    >
      <span
        className="inline-block w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: healthColors[health as Health] ?? "#999" }}
      />
      {showLabel ? text : null}
    </span>
  );
};
