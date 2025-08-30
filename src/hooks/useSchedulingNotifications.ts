/**
 * TRINITY FAT LOSS - Hook per Video Call Scheduling
 */

import { useState, useEffect } from "react";

export interface SchedulingNotification {
  id: string;
  type:
    | "proposal_received"
    | "proposal_confirmed"
    | "proposal_rejected"
    | "call_starting"
    | "call_reminder";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

/**
 * Hook per gestire le notifiche del sistema scheduling
 */
export function useSchedulingNotifications(trioId: string) {
  const [notifications, setNotifications] = useState<SchedulingNotification[]>(
    []
  );

  // Simula notifiche per demo
  useEffect(() => {
    const mockNotifications: SchedulingNotification[] = [
      {
        id: "1",
        type: "proposal_received",
        title: "Nuova Proposta",
        message: "Claudio ha proposto una videochiamata per Martedì 15:00",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minuti fa
        read: false,
      },
      {
        id: "2",
        type: "proposal_confirmed",
        title: "Proposta Confermata",
        message:
          "La videochiamata di Giovedì 16:00 è stata confermata da tutti",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 ore fa
        read: true,
      },
      {
        id: "3",
        type: "call_reminder",
        title: "Promemoria Chiamata",
        message: "La tua Trinity call inizia tra 15 minuti",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minuti fa
        read: false,
      },
    ];

    setNotifications(mockNotifications);
  }, [trioId]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (
    notification: Omit<SchedulingNotification, "id">
  ) => {
    const newNotification: SchedulingNotification = {
      ...notification,
      id: Date.now().toString(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  return {
    notifications,
    markAsRead,
    clearAll,
    addNotification,
  };
}
