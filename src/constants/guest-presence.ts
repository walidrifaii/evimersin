export const GUEST_ONLINE_WINDOW_SECONDS = 90;

export function clampOnlineWindowSeconds(value: number) {
  return Math.max(30, Math.min(300, Math.floor(value)));
}
