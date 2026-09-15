import { useQuery } from "@tanstack/react-query";
import { getStoredToken } from "../lib/github";
import { queryKeys } from "../lib/queryKeys";

export function useToken() {
  return useQuery({ queryKey: queryKeys.token, queryFn: getStoredToken, staleTime: Infinity });
}
