const USER_DRAFT_KEY = "evimersin_user_draft";

export type UserDraftForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  emailOtp: string;
  permissions: string[];
  status: 0 | 1;
};

export type UserDraft = {
  mode: "create" | "edit";
  userId?: number;
  form: UserDraftForm;
};

export function saveUserDraft(draft: UserDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(USER_DRAFT_KEY, JSON.stringify(draft));
}

export function loadUserDraft(): UserDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(USER_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as UserDraft) : null;
  } catch {
    return null;
  }
}

export function clearUserDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(USER_DRAFT_KEY);
}
