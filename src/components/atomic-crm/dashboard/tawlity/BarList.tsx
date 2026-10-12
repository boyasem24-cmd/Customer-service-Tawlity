import { Link } from "react-router";
import { cn } from "@/lib/utils";

export type BarListItem = {
  key: string;
  label: string;
  value: number;
  /** Optional link, e.g. to the list filtered on this item */
  to?: string;
};

/**
 * Horizontal bars for one series (magnitude), in a single hue. Labels and
 * values stay in text ink; hovering a row highlights it and shows its share.
 */
export const BarList = ({
  items,
  formatValue = (value) => String(value),
  className,
}: {
  items: BarListItem[];
  formatValue?: (value: number) => string;
  className?: string;
}) => {
  const max = Math.max(1, ...items.map((item) => item.value));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const share = total ? Math.round((item.value / total) * 100) : 0;
        const row = (
          <div
            className="group grid grid-cols-[minmax(6rem,9rem)_1fr_auto] items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted"
            title={`${item.label}: ${formatValue(item.value)} (${share}%)`}
          >
            <span className="text-sm truncate">{item.label}</span>
            <div className="h-3 rounded-sm bg-muted/60 group-hover:bg-background">
              <div
                className="h-3 rounded-e-[4px] bg-primary opacity-80 group-hover:opacity-100 transition-opacity"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  minWidth: item.value ? 4 : 0,
                }}
              />
            </div>
            <span className="text-sm tabular-nums text-end min-w-12">
              {formatValue(item.value)}
              <span className="ms-1 text-xs text-muted-foreground hidden group-hover:inline">
                {share}%
              </span>
            </span>
          </div>
        );
        return item.to ? (
          <Link key={item.key} to={item.to} className="no-underline">
            {row}
          </Link>
        ) : (
          <div key={item.key}>{row}</div>
        );
      })}
    </div>
  );
};
