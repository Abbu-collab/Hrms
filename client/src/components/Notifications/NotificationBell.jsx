import { useEffect, useState, useRef, useCallback } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notificationService";
import { FiBell, FiCheckCircle, FiXCircle, FiClock, FiCheck, FiInfo } from "react-icons/fi";
import "./NotificationBell.css";

const NOTIF_ICONS = {
  leave_applied:  <FiClock className="notif-icon notif-icon-pending" size={15} />,
  leave_approved: <FiCheckCircle className="notif-icon notif-icon-success" size={15} />,
  leave_rejected: <FiXCircle className="notif-icon notif-icon-error" size={15} />,
  leave_cancelled:<FiInfo className="notif-icon notif-icon-info" size={15} />,
  general:        <FiBell className="notif-icon notif-icon-info" size={15} />,
};

const NOTIF_LABELS = {
  leave_applied:  "Leave Applied",
  leave_approved: "Leave Approved",
  leave_rejected: "Leave Rejected",
  leave_cancelled:"Leave Cancelled",
  general:        "Notification",
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isOpen, setIsOpen]               = useState(false);
  const [loading, setLoading]             = useState(false);
  const dropdownRef                       = useRef(null);

  // Request browser Notification API permission gracefully
  const requestBrowserPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.warn("Browser notification permission request skipped:", err.message);
      }
    }
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const data = await getNotifications();
      const list = data?.notifications || [];
      setNotifications(list);
      setUnreadCount(data?.unreadCount || list.filter((n) => !n.read).length);

      // Trigger browser notification for the latest unread notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        const latestUnread = list.find((n) => !n.read);
        if (latestUnread) {
          const key = `shown_notif_${latestUnread._id}`;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            new Notification("HRMS Notification", {
              body: latestUnread.message,
              icon: "/favicon.ico",
            });
          }
        }
      }
    } catch (err) {
      // Fail silently if unauthenticated or network error
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    requestBrowserPermission();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs, requestBrowserPermission]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notif-bell-wrap" ref={dropdownRef}>
      <button
        type="button"
        className={`notif-bell-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "Notifications"}
        aria-label={unreadCount > 0 ? `Notifications - ${unreadCount} unread` : "Notifications"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <div className="notif-header-title">
              <h3>Notifications</h3>
              {unreadCount > 0 && <span className="notif-count-pill">{unreadCount} unread</span>}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all-btn"
                onClick={handleMarkAllRead}
                disabled={loading}
              >
                <FiCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <FiBell size={28} style={{ color: "var(--slate-300)" }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notif-item ${notif.read ? "read" : "unread"}`}
                  onClick={(e) => !notif.read && handleMarkRead(notif._id, e)}
                  role="listitem"
                >
                  <div className="notif-item-left">
                    {NOTIF_ICONS[notif.type] || NOTIF_ICONS.general}
                  </div>

                  <div className="notif-item-content">
                    <span className="notif-item-type">
                      {NOTIF_LABELS[notif.type] || "Notification"}
                    </span>
                    <p className="notif-item-msg">{notif.message}</p>
                    <span className="notif-item-time">{formatTimeAgo(notif.createdAt)}</span>
                  </div>

                  {!notif.read && (
                    <button
                      type="button"
                      className="notif-read-dot-btn"
                      onClick={(e) => handleMarkRead(notif._id, e)}
                      title="Mark as read"
                      aria-label="Mark notification as read"
                    >
                      <span className="notif-unread-dot" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
