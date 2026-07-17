"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { hydrateAuth } from "@/store/slices/auth/authSlice";
import { readAuth } from "@/store/slices/auth/authStorage";
import { store } from "@/store/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateAuth(readAuth()));
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
