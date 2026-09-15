import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/github";
import { queryKeys } from "../lib/queryKeys";

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.token, null);
      queryClient.removeQueries({ queryKey: queryKeys.viewer });
    },
  });
}
