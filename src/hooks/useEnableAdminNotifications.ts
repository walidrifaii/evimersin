"use client";

import { useCallback, useState } from "react";
import { getNotificationIconUrl } from "@/lib/firebase/notification-icon";
import {
  listenForForegroundMessages,
  requestFcmToken,
  type FirebaseClientConfig,
} from "@/lib/firebase/client";
import { getApiErrorMessage } from "@/store/api/errors";
import { useRegisterFcmTokenMutation } from "@/store/slices/admin/fcmApi";

type EnableInput = {
  config: FirebaseClientConfig;
  vapidKey: string;
};

export function useEnableAdminNotifications() {
  const [registerToken, registerState] = useRegisterFcmTokenMutation();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const startForegroundListener = useCallback(async (config: FirebaseClientConfig) => {
    return listenForForegroundMessages(config, (payload) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      new Notification(payload.title ?? "EviMersin", {
        body: payload.body ?? "New website visitor",
        icon: getNotificationIconUrl(),
      });
    });
  }, []);

  const enable = useCallback(
    async ({ config, vapidKey }: EnableInput) => {
      setError("");
      setMessage("");

      try {
        const token = await requestFcmToken({ config, vapidKey });
        if (!token) {
          setError("Notifications were blocked or not supported in this browser.");
          return false;
        }

        await registerToken({
          token,
          deviceLabel: navigator.userAgent.slice(0, 120),
        }).unwrap();

        await startForegroundListener(config);
        setMessage("Browser notifications enabled for new website visitors.");
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return false;
      }
    },
    [registerToken, startForegroundListener],
  );

  return {
    enable,
    error,
    message,
    isLoading: registerState.isLoading,
    clearFeedback: () => {
      setError("");
      setMessage("");
    },
  };
}

export const ADMIN_FCM_LOGIN_PROMPT_KEY = "evimersin_fcm_login_prompt";
