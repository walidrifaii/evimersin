import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import { api } from "@/store/api/baseApi";
import "@/store/slices/auth/authApi";
import "@/store/slices/admin";
import authReducer, {
  clearCredentials,
  setCredentials,
} from "@/store/slices/auth/authSlice";
import { removeAuth, saveAuth } from "@/store/slices/auth/authStorage";

const authListener = createListenerMiddleware();

authListener.startListening({
  matcher: isAnyOf(setCredentials, clearCredentials),
  effect: (_action, listenerApi) => {
    const auth = (listenerApi.getState() as RootState).auth;

    if (
      auth.accessToken &&
      auth.refreshToken &&
      auth.tokenType &&
      auth.expiresIn &&
      auth.admin
    ) {
      saveAuth({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        admin: auth.admin,
        tokenType: auth.tokenType,
        expiresIn: auth.expiresIn,
      });
    } else {
      removeAuth();
    }
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(authListener.middleware)
      .concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
