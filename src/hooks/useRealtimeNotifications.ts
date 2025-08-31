/**
 * TRINITY FAT LOSS - Realtime Notifications Hook
 * Hook per gestire le notifiche in tempo reale via Supabase Realtime
 */

import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useToastNotifications } from "./useToastNotifications";

interface NotificationRecord {
  id: string;
  user_id: string;
  notification_type:
    | "trio_formation"
    | "trio_formation_failed"
    | "video_call_reminder"
    | "chat_message"
    | "achievement";
  title: string;
  message: string;
  channels: string[];
  data?: Record<string, unknown>;
  toast_status: "not_sent" | "sent" | "failed";
  created_at: string;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { addNotification } = useToastNotifications();

  useEffect(() => {
    if (!user?.id) {
      console.log("🔌 RealtimeNotifications - No user, skipping subscription");
      return;
    }

    console.log(
      "🔌 RealtimeNotifications - Setting up realtime subscription for user:",
      user.id
    );

    // Subscribe to notification_logs table per questo utente
    const subscription = supabase
      .channel("notification_logs_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_logs",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            "🔔 RealtimeNotifications - Received realtime notification:",
            payload
          );

          const notification = payload.new as NotificationRecord;

          // Verifica che sia una notificazione toast
          if (notification.channels.includes("toast")) {
            console.log(
              "🍞 RealtimeNotifications - Processing toast notification:",
              notification.title
            );

            // Aggiungi il toast alla UI
            addNotification({
              title: notification.title,
              message: notification.message,
              type: notification.notification_type,
              data: notification.data || {},
              duration: 8000,
            });

            // Aggiorna lo status del toast nel database
            updateToastStatus(notification.id);
          }
        }
      )
      .subscribe((status) => {
        console.log("🔌 RealtimeNotifications - Subscription status:", status);
      });

    return () => {
      console.log("🔌 RealtimeNotifications - Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, [user?.id, addNotification]);

  const updateToastStatus = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notification_logs")
        .update({ toast_status: "sent" })
        .eq("id", notificationId);

      if (error) {
        console.error(
          "❌ RealtimeNotifications - Failed to update toast status:",
          error
        );
      } else {
        console.log(
          "✅ RealtimeNotifications - Toast status updated for notification:",
          notificationId
        );
      }
    } catch (error) {
      console.error(
        "❌ RealtimeNotifications - Error updating toast status:",
        error
      );
    }
  };
};
