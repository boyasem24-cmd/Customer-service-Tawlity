import { useQueries } from "@tanstack/react-query";
import { useDataProvider } from "ra-core";

/**
 * Counts records of a resource for several filters, one lightweight query per
 * filter (perPage 1, reading `total`), so it scales with the database size.
 */
export const useCounts = (
  resource: string,
  filters: Record<string, Record<string, unknown>>,
) => {
  const dataProvider = useDataProvider();
  const keys = Object.keys(filters);
  const results = useQueries({
    queries: keys.map((key) => ({
      queryKey: [resource, "getList", "count", filters[key]],
      queryFn: () =>
        dataProvider
          .getList(resource, {
            filter: filters[key],
            pagination: { page: 1, perPage: 1 },
            sort: { field: "id", order: "ASC" },
          })
          .then(({ total }) => total ?? 0),
    })),
  });
  const counts = Object.fromEntries(
    keys.map((key, index) => [key, results[index].data ?? 0]),
  ) as Record<string, number>;
  return { counts, isPending: results.some((result) => result.isPending) };
};
