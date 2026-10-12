import { useGetManyAggregate } from "ra-core";

import type { DinerTag } from "../types";

export const DinerTagsList = ({ ids }: { ids?: DinerTag["id"][] | null }) => {
  const { data } = useGetManyAggregate<DinerTag>(
    "diner_tags",
    { ids: ids ?? [] },
    { enabled: !!ids?.length },
  );
  if (!ids?.length || !data) return null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {data.map((tag) => (
        <span
          key={tag.id}
          className="rounded-md px-1.5 py-0.5 text-xs text-black"
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
        </span>
      ))}
    </span>
  );
};
