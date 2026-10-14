import { isBefore, startOfDay } from "date-fns";
import { useGetList } from "ra-core";

import type { Task } from "../../types";

/** Open tasks (not done), soonest first. Shared by the KPI tiles and the panel. */
export const useOpenTasks = () => {
  const result = useGetList<Task>("tasks", {
    filter: { "done_date@is": null },
    sort: { field: "due_date", order: "ASC" },
    pagination: { page: 1, perPage: 500 },
  });
  // A task marked done updates the cached list before it is refetched
  return {
    ...result,
    data: result.data?.filter((task) => task.done_date == null),
  };
};

export const isOverdue = (task: Task) =>
  isBefore(new Date(task.due_date), startOfDay(new Date()));
