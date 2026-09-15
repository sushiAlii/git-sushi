import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type DeviceCode, pollDeviceFlow, startDeviceFlow } from "../lib/github";
import { queryKeys } from "../lib/queryKeys";

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const deviceCode = await startDeviceFlow();
      queryClient.setQueryData(queryKeys.deviceCode, deviceCode);
      return pollDeviceFlow(deviceCode.device_code, deviceCode.interval);
    },
    onSuccess: (token) => queryClient.setQueryData(queryKeys.token, token),
    onSettled: () => queryClient.setQueryData(queryKeys.deviceCode, null),
  });
}

export function useDeviceCode() {
  return useQuery<DeviceCode | null>({
    queryKey: queryKeys.deviceCode,
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
  });
}
