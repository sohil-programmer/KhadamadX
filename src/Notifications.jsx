import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Notifications.css";

const defaultNotifications = [];

const readJSON = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return fallback;
  }
};

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const getCurrentUser = () => {
  const user = readJSON("user", null);

  if (!user || typeof user !== "object") {
    return null;
  }

  return user;
};

function Notifications() {
  const [user, setUser] = useState(() => getCurrentUser());

  const [notifications, setNotifications] = useState(() => {
    const currentUser = getCurrentUser();

    if (!currentUser?.email) {
      return [];
    }

    const allNotifications = readJSON(
      "notifications",
      defaultNotifications
    );

    const userEmail = normalizeEmail(currentUser.email);

    return allNotifications.filter(
      (notification) =>
        normalizeEmail(notification.email) === userEmail
    );
  });

  const loadNotifications = () => {
    const currentUser = getCurrentUser();

    setUser(currentUser);

    if (!currentUser?.email) {
      setNotifications([]);
      return;
    }

    const allNotifications = readJSON(
      "notifications",
      defaultNotifications
    );

    const userEmail = normalizeEmail(currentUser.email);

    const userNotifications = allNotifications
      .filter(
        (notification) =>
          normalizeEmail(notification.email) === userEmail
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.date || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || b.date || 0
        ).getTime();

        return dateB - dateA;
      });

    setNotifications(userNotifications);
  };

  useEffect(() => {
    loadNotifications();

    const handleNotificationsUpdate = () => {
      loadNotifications();
    };

    const handleStorage = (event) => {
      if (
        event.key === "notifications" ||
        event.key === "user"
      ) {
        loadNotifications();
      }
    };

    const handleAuthChange = () => {
      loadNotifications();
    };

    window.addEventListener(
      "notificationsUpdated",
      handleNotificationsUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "authChange",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "authChange",
        handleAuthChange
      );
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const updateNotifications = (updatedUserNotifications) => {
    const allNotifications = readJSON(
      "notifications",
      []
    );

    const currentUserEmail = normalizeEmail(
      user?.email
    );

    const updatedMap = new Map(
      updatedUserNotifications.map(
        (notification) => [
          notification.id,
          notification,
        ]
      )
    );

    const updatedAllNotifications = allNotifications.map(
      (notification) => {
        const notificationEmail = normalizeEmail(
          notification.email
        );

        if (
          notificationEmail === currentUserEmail &&
          updatedMap.has(notification.id)
        ) {
          return updatedMap.get(notification.id);
        }

        return notification;
      }
    );

    localStorage.setItem(
      "notifications",
      JSON.stringify(updatedAllNotifications)
    );

    setNotifications(updatedUserNotifications);

    window.dispatchEvent(
      new Event("notificationsUpdated")
    );
  };

  const markAsRead = (id) => {
    const updated = notifications.map(
      (notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
    );

    updateNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

    updateNotifications(updated);
  };

  const getIcon = (type) => {
    if (type === "order") return "📦";
    if (type === "service") return "🛎️";
    if (type === "success") return "✅";
    if (type === "warning") return "⚠️";
    if (type === "error") return "❌";

    return "🔔";
  };

  const getNotificationTime = (notification) => {
    if (notification.time) {
      return notification.time;
    }

    const date =
      notification.createdAt ||
      notification.date;

    if (!date) {
      return "Just now";
    }

    const timestamp = new Date(date);

    if (Number.isNaN(timestamp.getTime())) {
      return "Just now";
    }

    return timestamp.toLocaleString();
  };

  return (
    <div className="notifications-page">

      <div className="notifications-header">

        <div>
          <Link
            to="/"
            className="back-link"
          >
            ← Back to Home
          </Link>

          <h1>
            Notifications

            {unreadCount > 0 && (
              <span className="unread-number">
                {unreadCount}
              </span>
            )}
          </h1>

          <p>
            Stay updated with your latest
            activities and orders.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
          >
            ✓ Mark all as read
          </button>
        )}

      </div>

      <div className="notifications-container">

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notification-icon">
              🔔
            </div>

            <h3>No notifications yet</h3>

            <p>
              You will see your latest activities
              and order updates here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                !notification.read
                  ? "unread"
                  : ""
              }`}
            >

              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>

              <div className="notification-content">

                <div className="notification-title-row">

                  <h3>
                    {notification.title}
                  </h3>

                  {!notification.read && (
                    <span className="new-dot"></span>
                  )}

                </div>

                <p>
                  {notification.message}
                </p>

                <span className="notification-time">
                  🕒 {getNotificationTime(notification)}
                </span>

              </div>

              {!notification.read && (
                <button
                  className="read-btn"
                  onClick={() =>
                    markAsRead(notification.id)
                  }
                >
                  Mark as read
                </button>
              )}

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Notifications;