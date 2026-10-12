import type { ReactNode } from "react";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** KPI tile: a label, one headline value and an optional hint line. */
export const StatTile = ({
  label,
  value,
  hint,
  to,
  tone,
  isPending,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  to?: string;
  tone?: "alert";
  isPending?: boolean;
}) => {
  const content = (
    <Card
      className={cn(
        "p-4 gap-1 h-full",
        to && "hover:bg-muted transition-colors",
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-2xl font-semibold tabular-nums",
          tone === "alert" && "text-red-600 dark:text-red-400",
        )}
      >
        {isPending ? "…" : value}
      </span>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </Card>
  );
  return to ? (
    <Link to={to} className="no-underline">
      {content}
    </Link>
  ) : (
    content
  );
};
