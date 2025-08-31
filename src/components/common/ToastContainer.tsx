/**
 * TRINITY FAT LOSS - Toast Container Component
 * Componente per visualizzare le notifiche toast in-app
 */

import React from "react";
import { X } from "lucide-react";
import {
  useToastNotifications,
  getNotificationIcon,
  getNotificationColorClasses,
} from "../../hooks/useToastNotifications";

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useToastNotifications();

  // Debug log
  console.log(
    "🍞 ToastContainer render - notifications count:",
    notifications.length,
    notifications
  );

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            max-w-sm p-4 border rounded-lg shadow-lg animate-slide-in-right
            ${getNotificationColorClasses(notification.type)}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-xl flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm opacity-90">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
