import { onAuthStateChanged, type Auth } from "firebase/auth";

import { beginApiActivity } from "@/lib/apiActivity";
import { getFirebaseAuth } from "@/lib/firebase";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://hackbattle26-backend.onrender.com"
).replace(/\/+$/, "");

function waitForAuthUser(
  auth: Auth
): Promise<import("firebase/auth").User | null> {
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        resolve(auth.currentUser);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        unsubscribe();
        resolve(user);
      }
    });
  });
}

async function performAuthenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; status: number }> {
  const auth = getFirebaseAuth();

  if (!auth) {
    console.error("Firebase Auth is not initialized.");
    return {
      data: null,
      status: 500,
    };
  }

  // Wait until Firebase finishes restoring the authentication state
  const user = auth.currentUser ?? (await waitForAuthUser(auth));

  if (!user) {
    console.error("No authenticated Firebase user found.");
    return {
      data: null,
      status: 401,
    };
  }

  const token = await user.getIdToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const requestUrl = `${BASE_URL}${endpoint}`;
  const method = options.method || "GET";

  try {
    const res = await fetch(requestUrl, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type");

    let data: T | null = null;

    if (contentType?.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();

      if (text) {
        data = text as T;
      }
    }

    return {
      data,
      status: res.status,
    };
  } catch (error) {
    console.error(
      `[API Error] Request failed for ${method} ${requestUrl} (Auth token present: ${Boolean(token)}):`,
      error
    );

    return {
      data: null,
      status: 0,
    };
  }
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; status: number }> {
  const endActivity = beginApiActivity();

  try {
    return await performAuthenticatedFetch<T>(endpoint, options);
  } finally {
    endActivity();
  }
}

export interface CreateTeamResponse {
  message: string;
  code?: string;
}

export interface JoinTeamResponse {
  message: string;
}

export interface GetTeamResponse {
  id: string;
  name: string;
  code: string;
  leaderId: string;
  members: {
    email: string;
    name: string;
  }[];
  isLeader: boolean;
}

export interface SubmitProjectPayload {
  project_name: string;
  problem_stmt: string;
  track: string;
  subtrack: string;
  github_link: string;
  figma_link?: string;
  other_files?: string;
}

export interface GetProjectResponse {
  project_name?: string;
  problem_stmt?: string;
  track?: string;
  subtrack?: string;
  github_link?: string;
  figma_link?: string;
  other_files?: string;
}

export interface SubmitProjectResponse {
  message?: string;
}

export const api = {
  createTeam: (name: string) =>
    fetchWithAuth<CreateTeamResponse>("/teams/create", {
      method: "POST",
      body: JSON.stringify({
        name,
      }),
    }),

  joinTeam: (teamCode: string) =>
    fetchWithAuth<JoinTeamResponse>("/teams/join", {
      method: "POST",
      body: JSON.stringify({
        team_code: teamCode.toUpperCase(),
      }),
    }),

  leaveTeam: () =>
    fetchWithAuth<{ message: string }>("/teams/leave-team", {
      method: "DELETE",
    }),

  getTeam: () =>
    fetchWithAuth<GetTeamResponse>("/teams/get", {
      method: "GET",
    }),
  getProject: () =>
  fetchWithAuth<GetProjectResponse>("/teams/project", {
    method: "GET",
  }),

  submitProject: (payload: SubmitProjectPayload) =>
    fetchWithAuth<SubmitProjectResponse>("/teams/project/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
