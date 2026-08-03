import { NOTIFICATION_ICON_PATH } from "@/constants/notifications";
import { getAppBaseUrl } from "@/lib/image-url";

export function getNotificationIconUrl() {
  return `${getAppBaseUrl()}${NOTIFICATION_ICON_PATH}`;
}
