import type { AuthSession } from "@/store/slices/auth/authTypes";

const AUTH_KEY = "evimersin_auth";

export function readAuth(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(AUTH_KEY);
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveAuth(session: AuthSession) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function removeAuth() {
  localStorage.removeItem(AUTH_KEY);
}
