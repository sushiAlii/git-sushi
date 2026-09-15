import { useQuery } from "@tanstack/react-query";
import { fetchPullRequests } from "../lib/github";
import { queryKeys } from "../lib/queryKeys";
import { useToken } from "./useToken";

export function usePullRequests() {
  const token = useToken();

  return useQuery({
    queryKey: queryKeys.pullRequests,
    queryFn: () => fetchPullRequests(token.data as string),
    enabled: Boolean(token.data),
    refetchInterval: 2 * 60 * 1000,
  });
}
