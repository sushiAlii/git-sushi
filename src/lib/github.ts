import { invoke } from "@tauri-apps/api/core";

async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

async function graphqlRequest<T>(
  token: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }

  const payload = await response.json();
  return payload.data as T;
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

export type PullRequest = {
  id: string;
  number: number;
  title: string;
  url: string;
  isDraft: boolean;
  updatedAt: string;
  repository: { nameWithOwner: string };
  author: { login: string } | null;
};

export type PullRequestBuckets = {
  authored: PullRequest[];
  reviewRequested: PullRequest[];
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
  const data = await graphqlRequest<{ viewer: Viewer }>(
    token,
    `{ viewer { login name avatarUrl } }`,
  );
  return data.viewer;
}

const PULL_REQUEST_FIELDS = `
  id
  number
  title
  url
  isDraft
  updatedAt
  repository { nameWithOwner }
  author { login }
`;

const PULL_REQUESTS_QUERY = `
  query PullRequestsNeedingAttention($authored: String!, $reviewRequested: String!) {
    authored: search(query: $authored, type: ISSUE, first: 25) {
      nodes { ...on PullRequest { ${PULL_REQUEST_FIELDS} } }
    }
    reviewRequested: search(query: $reviewRequested, type: ISSUE, first: 25) {
      nodes { ...on PullRequest { ${PULL_REQUEST_FIELDS} } }
    }
  }
`;

export async function fetchPullRequests(token: string): Promise<PullRequestBuckets> {
  const data = await graphqlRequest<{
    authored: { nodes: PullRequest[] };
    reviewRequested: { nodes: PullRequest[] };
  }>(token, PULL_REQUESTS_QUERY, {
    authored: "is:pr is:open author:@me archived:false",
    reviewRequested: "is:pr is:open review-requested:@me archived:false",
  });

  return { authored: data.authored.nodes, reviewRequested: data.reviewRequested.nodes };
}
