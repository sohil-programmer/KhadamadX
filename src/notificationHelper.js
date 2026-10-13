const NOTIFICATIONS_KEY = "notifications";

const readNotifications = () => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read notifications:", error);
    return [];
  }
};

const generateNotificationId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

export const createNotification = ({
  email,
  title,
  message,
  icon = "🔔",
  type = "order",
}) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const cleanTitle = String(title || "").trim();
  const cleanMessage = String(message || "").trim();

  if (!normalizedEmail) {
    console.warn("Notification email is missing.");
    return false;
  }

  if (!cleanTitle || !cleanMessage) {
    console.warn(
      "Notification title or message is missing."
    );
    return false;
  }

  const notifications = readNotifications();

  const now = new Date().toISOString();

  const newNotification = {
    id: generateNotificationId(),

    email: normalizedEmail,

    title: cleanTitle,

    message: cleanMessage,

    icon: icon || "🔔",

    type: type || "order",

    read: false,

    date: now,

    createdAt: now,
  };

  const updatedNotifications = [
    newNotification,
    ...notifications,
  ];

  try {
    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(updatedNotifications)
    );

    window.dispatchEvent(
      new Event("notificationsUpdated")
    );

    return newNotification;
  } catch (error) {
    console.error(
      "Failed to save notification:",
      error
    );

    return false;
  }
};