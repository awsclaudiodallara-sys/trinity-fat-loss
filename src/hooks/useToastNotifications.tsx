/**
 * TRINITY FAT LOSS - Toast Notifications Hook
 * Hook React per gestire le notifiche toast in-app
 */

import { useState, useEffect, useCallback } from "react";

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type:
    | "trio_formation"
    | "trio_formation_failed"
    | "video_call_reminder"
    | "chat_message"
    | "achievement"
    | "success"
    | "error"
    | "info";
  data?: Record<string, unknown>;
  duration?: number; // ms, default 5000
}

/**
 * Hook per gestire le notifiche toast
 */
export function useToastNotifications() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // Aggiungi notifica
  const addNotification = useCallback(
    (notification: Omit<ToastNotification, "id">) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newNotification: ToastNotification = {
        ...notification,
        id,
        duration: notification.duration || 5000,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove dopo la durata specificata
      setTimeout(() => {
        setNotifications((current) => current.filter((n) => n.id !== id));
      }, newNotification.duration);

      return id;
    },
    []
  );

  // Rimuovi notifica
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Pulisci tutte le notifiche
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listener per notifiche dal notification service
  useEffect(() => {
    const handleTrinityNotification = (event: CustomEvent) => {
      const { title, message, type, data } = event.detail;

      addNotification({
        title,
        message,
        type,
        data,
        duration: type === "trio_formation" ? 8000 : 5000, // Trio formation più duraturo
      });
    };

    // Ascolta eventi personalizzati dal notification service
    window.addEventListener(
      "trinity-notification",
      handleTrinityNotification as EventListener
    );

    return () => {
      window.removeEventListener(
        "trinity-notification",
        handleTrinityNotification as EventListener
      );
    };
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}

// Utility functions per i componenti
export const getToastIcon = (type: ToastNotification["type"]): string => {
  switch (type) {
    case "trio_formation":
      return "🎉";
    case "trio_formation_failed":
      return "⏳";
    case "video_call_reminder":
      return "📹";
    case "chat_message":
      return "💬";
    case "achievement":
      return "🏆";
    case "success":
      return "✅";
    case "error":
      return "❌";
    default:
      return "ℹ️";
  }
};

export const getToastColorClasses = (
  type: ToastNotification["type"]
): string => {
  switch (type) {
    case "trio_formation":
      return "bg-green-50 border-green-200 text-green-800";
    case "trio_formation_failed":
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    case "video_call_reminder":
      return "bg-blue-50 border-blue-200 text-blue-800";
    case "chat_message":
      return "bg-purple-50 border-purple-200 text-purple-800";
    case "achievement":
      return "bg-orange-50 border-orange-200 text-orange-800";
    case "error":
      return "bg-red-50 border-red-200 text-red-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
};
