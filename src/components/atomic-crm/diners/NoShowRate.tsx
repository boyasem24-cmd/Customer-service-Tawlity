import { cn } from "@/lib/utils";

import type { Diner } from "../types";
import {
  formatPercent,
  getNoShowRate,
  NO_SHOW_ALERT_THRESHOLD,
} from "./dinerModel";

/** No-show rate (no-shows ÷ reservations), red above 20%. */
export const NoShowRate = ({
  diner,
  className,
}: {
  diner: Pick<Diner, "total_reservations" | "total_no_shows">;
  className?: string;
}) => {
  const rate = getNoShowRate(diner);
  const alert = rate != null && rate > NO_SHOW_ALERT_THRESHOLD;
  return (
    <span
      className={cn(
        "tabular-nums",
        alert && "font-semibold text-red-600 dark:text-red-400",
        className,
      )}
      title={`${diner.total_no_shows ?? 0} / ${diner.total_reservations ?? 0}`}
    >
      {formatPercent(rate)}
    </span>
  );
};
