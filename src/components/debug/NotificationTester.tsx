/**
 * TRINITY FAT LOSS - Notification Tester Component
 * Componente temporaneo per testare il sistema di notifiche
 */

import React from "react";
import { useToastNotifications } from "../../hooks/useToastNotifications";

export const NotificationTester: React.FC = () => {
  const { addNotification, notifications, clearAll } = useToastNotifications();

  const testNotifications = () => {
    // Test trio formation
    addNotification({
      title: "🎉 Trio Formato!",
      message: "Il tuo Trinity Team è stato creato con successo!",
      type: "trio_formation",
      duration: 8000,
    });

    // Test altro tipo
    setTimeout(() => {
      addNotification({
        title: "✅ Test Completato",
        message: "Questo è un test delle notifiche toast.",
        type: "success",
        duration: 5000,
      });
    }, 1000);
  };

  const testTrioFormationService = async () => {
    try {
      // Importa e testa il NotificationService direttamente
      const { NotificationService } = await import(
        "../../services/notificationService"
      );

      console.log("🔥 Testing NotificationService.notifyTrioFormationSuccess");

      // Simula dati trio realistici
      await NotificationService.notifyTrioFormationSuccess("test-user-id", {
        id: "f98af41a-afd4-4962-b4e5-cb047d7cc1c0",
        name: "Trinity Test Team",
        memberNames: ["Mario Rossi", "Luca Bianchi"],
      });

      console.log("✅ NotificationService test completed");
    } catch (error) {
      console.error("❌ NotificationService test failed:", error);
    }
  };

  const testTrioFormationEvent = () => {
    // Simula l'evento che viene lanciato dal NotificationService
    const event = new CustomEvent("trinity-notification", {
      detail: {
        title: "🎉 Trinity Team Formato!",
        message: "Il tuo team è pronto per iniziare il percorso insieme!",
        type: "trio_formation",
        data: {
          trioId: "test-123",
          memberNames: ["Mario", "Luca"],
        },
      },
    });

    console.log("🔥 Dispatching trinity-notification event:", event);
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold text-sm mb-3">🔔 Notification Tester</h3>

      <div className="space-y-2">
        <button
          onClick={testNotifications}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Test Toast Hook
        </button>

        <button
          onClick={testTrioFormationEvent}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          Test Trio Event
        </button>

        <button
          onClick={testTrioFormationService}
          className="w-full bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
        >
          Test Service
        </button>

        <button
          onClick={clearAll}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Clear All ({notifications.length})
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        Active: {notifications.length} notifications
      </div>
    </div>
  );
};
