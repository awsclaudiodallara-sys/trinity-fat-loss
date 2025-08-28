import React, { useState, useEffect } from "react";
import { MessageCircle, Users, Send } from "lucide-react";
import type { ChatMessage } from "../../services/trinityChatService";
import { trinityChatService } from "../../services/trinityChatService";

interface ChatPreviewProps {
  trioId: string;
  currentUserId?: string;
  onOpenChat?: () => void;
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({
  trioId,
  currentUserId,
  onOpenChat,
}) => {
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Debug: log dei parametri ricevuti
    console.log(
      "🔍 ChatPreview INIT - trioId:",
      trioId,
      "currentUserId:",
      currentUserId
    );

    // Carica i messaggi iniziali
    const loadMessages = async () => {
      try {
        console.log("🔍 ChatPreview - Loading messages for trio:", trioId);

        // Usa solo il trio_id reale passato come parametro
        const messages = await trinityChatService.getMessages(trioId, 50);
        console.log(
          "🔍 ChatPreview - Messages for",
          trioId,
          ":",
          messages.length
        );

        console.log("🔍 ChatPreview - Final messages loaded:", messages);
        setRecentMessages(messages.slice(-3).reverse()); // Ultimi 3 messaggi in ordine inverso per display

        // Ottieni il contatore non letti
        if (currentUserId) {
          try {
            const unread = await trinityChatService.getUnreadCount(
              trioId,
              currentUserId
            );
            console.log("ChatPreview - Unread count:", unread);
            setUnreadCount(unread);
          } catch (unreadError) {
            console.warn(
              "ChatPreview - Could not get unread count:",
              unreadError
            );
            setUnreadCount(0);
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        // In caso di errore, lascia vuoto invece di mostrare dati fake
        setRecentMessages([]);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Sottoscrizione ai nuovi messaggi
    console.log("🔍 ChatPreview - Subscribing to:", trioId);
    const channel = trinityChatService.subscribeToMessages(
      trioId,
      (newMessage) => {
        console.log("🔍 ChatPreview - New message received:", newMessage);
        setRecentMessages((prev) => {
          const updated = [...prev, newMessage];
          return updated.slice(-3).reverse(); // Mantieni solo gli ultimi 3 in ordine inverso
        });

        // Aggiorna contatore non letti se il messaggio non è dell'utente corrente
        if (currentUserId && newMessage.user_id !== currentUserId) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    );

    return () => {
      trinityChatService.unsubscribeFromChannel(channel);
    };
  }, [trioId, currentUserId]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Ora";
    if (diffInMinutes < 60) return `${diffInMinutes}m fa`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h fa`;
    return date.toLocaleDateString();
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return "🏆";
      case "system":
        return "📢";
      case "image":
        return "📷";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Chat Trinity
            </h3>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Chat Trinity</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>3 membri</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {recentMessages
          .slice()
          .reverse()
          .map((message) => (
            <div key={message.id} className="border-l-2 border-gray-200 pl-3">
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-gray-800">
                      {message.user_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.created_at)}
                    </span>
                    {message.message_type !== "text" && (
                      <span className="text-xs">
                        {getMessageIcon(message.message_type)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenChat}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Apri Chat Completa
        </button>
        <button className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors">
          <Send className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Last activity:{" "}
        {recentMessages.length > 0
          ? formatTimestamp(
              recentMessages[recentMessages.length - 1].created_at
            )
          : "No messages"}
      </div>
    </div>
  );
};
