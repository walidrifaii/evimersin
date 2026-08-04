const VAPID_KEY_PATTERN = /^[A-Za-z0-9_-]+$/;

export type VapidKeyValidation = {
  valid: boolean;
  key: string | null;
  error: string | null;
};

function normalizeVapidKey(raw: string | undefined | null) {
  if (!raw) return "";

  return raw
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, "");
}

function decodeVapidKeyLength(key: string) {
  const padding = "=".repeat((4 - (key.length % 4)) % 4);
  const base64 = (key + padding).replace(/-/g, "+").replace(/_/g, "/");

  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").length;
  }

  if (typeof atob === "function") {
    return atob(base64).length;
  }

  return 0;
}

export function validateVapidKey(raw: string | undefined | null): VapidKeyValidation {
  const key = normalizeVapidKey(raw);

  if (!key) {
    return {
      valid: false,
      key: null,
      error: "NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.",
    };
  }

  if (key.includes("PASTE_") || key.includes("YOUR_")) {
    return {
      valid: false,
      key: null,
      error: "Replace the placeholder VAPID key in .env.local.",
    };
  }

  if (!VAPID_KEY_PATTERN.test(key)) {
    return {
      valid: false,
      key: null,
      error:
        "VAPID key has invalid characters. Use the Web Push key from Firebase only.",
    };
  }

  if (key.length < 80 || key.length > 200) {
    return {
      valid: false,
      key: null,
      error:
        "VAPID key length looks wrong. Copy the Web Push key pair from Firebase Cloud Messaging.",
    };
  }

  const decodedLength = decodeVapidKeyLength(key);
  if (decodedLength !== 65) {
    return {
      valid: false,
      key: null,
      error:
        "VAPID key format is invalid. In Firebase go to Project Settings → Cloud Messaging → Web Push certificates and copy the key pair value.",
    };
  }

  return {
    valid: true,
    key,
    error: null,
  };
}

export function getValidatedVapidKey() {
  return validateVapidKey(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
}
