import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthAdmin, AuthSession } from "@/store/slices/auth/authTypes";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: string | null;
  admin: AuthAdmin | null;
  hydrated: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  expiresIn: null,
  admin: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(_state, action: PayloadAction<AuthSession | null>) {
      return {
        accessToken: action.payload?.accessToken ?? null,
        refreshToken: action.payload?.refreshToken ?? null,
        tokenType: action.payload?.tokenType ?? null,
        expiresIn: action.payload?.expiresIn ?? null,
        admin: action.payload?.admin ?? null,
        hydrated: true,
      };
    },
    setCredentials(_state, action: PayloadAction<AuthSession>) {
      return {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        tokenType: action.payload.tokenType,
        expiresIn: action.payload.expiresIn,
        admin: action.payload.admin,
        hydrated: true,
      };
    },
    clearCredentials() {
      return { ...initialState, hydrated: true };
    },
  },
});

export const { hydrateAuth, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
