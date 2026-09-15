import { invoke } from "@tauri-apps/api/core";

async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export type DeviceCode = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
};

export type Viewer = {
  login: string;
  name: string | null;
  avatarUrl: string;
};

export function startDeviceFlow() {
  return invokeCommand<DeviceCode>("github_start_device_flow");
}

export function pollDeviceFlow(deviceCode: string, interval: number) {
  return invokeCommand<string>("github_poll_device_flow", { deviceCode, interval });
}

export function getStoredToken() {
  return invokeCommand<string | null>("github_stored_token");
}

export function logout() {
  return invokeCommand<void>("github_logout");
}

export async function fetchViewer(token: string): Promise<Viewer> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{ viewer { login name avatarUrl } }`,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }

  const payload = await response.json();
  return payload.data.viewer as Viewer;
}
