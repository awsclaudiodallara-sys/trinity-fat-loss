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

  // Rimuovi notifica
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

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

      console.log("🍞 addNotification called:", newNotification);

      setNotifications((prev) => {
        const updated = [...prev, newNotification];
        console.log("🍞 Notifications state updated:", updated);
        return updated;
      });

      // Auto-remove dopo la durata specificata
      setTimeout(() => {
        console.log("⏰ Auto-removing notification:", id);
        removeNotification(id);
      }, newNotification.duration);

      return id;
    },
    [removeNotification]
  );

  // Pulisci tutte le notifiche
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listener per notifiche dal notification service
  useEffect(() => {
    console.log("🎧 useToastNotifications - Setting up event listener...");

    const handleTrinityNotification = (event: CustomEvent) => {
      console.log(
        "📨 useToastNotifications - Received trinity-notification event:",
        event.detail
      );
      const { title, message, type, data } = event.detail;

      console.log("🍞 Adding toast notification:", { title, message, type });
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

    console.log("✅ Trinity notification event listener attached");

    // DEBUG: Aggiungi funzione di test al window per debug
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).testToastNotification = () => {
        console.log("🧪 Testing toast notification manually...");
        window.dispatchEvent(
          new CustomEvent("trinity-notification", {
            detail: {
              title: "🧪 Test Notification",
              message:
                "This is a test notification to verify the toast system is working",
              type: "success",
              data: { test: true },
            },
          })
        );
      };
      console.log("🧪 Added window.testToastNotification() for manual testing");
    }

    return () => {
      console.log("🧹 Cleaning up trinity notification event listener");
      window.removeEventListener(
        "trinity-notification",
        handleTrinityNotification as EventListener
      );
      // Rimuovi funzione di test
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).testToastNotification;
      }
    };
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}

/**
 * Utility functions per le notifiche (usabili da componenti esterni)
 */
export function getNotificationIcon(type: ToastNotification["type"]): string {
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
}

export function getNotificationColorClasses(
  type: ToastNotification["type"]
): string {
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
}
