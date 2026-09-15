import { useQuery } from "@tanstack/react-query";
import { fetchViewer } from "../lib/github";
import { queryKeys } from "../lib/queryKeys";
import { useToken } from "./useToken";

export function useViewer() {
  const token = useToken();

  return useQuery({
    queryKey: queryKeys.viewer,
    queryFn: () => fetchViewer(token.data as string),
    enabled: Boolean(token.data),
  });
}
