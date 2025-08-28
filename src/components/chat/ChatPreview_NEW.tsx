import React, { useState, useEffect } from "react";
import { MessageCircle, Send, Users } from "lucide-react";

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  message: string;
  timestamp: string;
  type: "text" | "achievement" | "system" | "image";
  metadata?: Record<string, unknown>;
}

interface ChatPreviewProps {
  trioId: string;
  currentUserId?: string;
  onOpenChat?: () => void;
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({
  trioId,
  onOpenChat,
}) => {
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        user_id: "user_2",
        user_name: "Marco",
        message: "Grande allenamento oggi! 💪",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: "text",
      },
      {
        id: "2",
        user_id: "user_3",
        user_name: "Giulia",
        message: "Anch'io ho completato gli esercizi! Ci vediamo domani?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        type: "text",
      },
      {
        id: "3",
        user_id: "user_2",
        user_name: "Marco",
        message: "Ha raggiunto un nuovo traguardo: 5kg persi! 🎉",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        type: "achievement",
      },
    ];

    setRecentMessages(mockMessages);
    setUnreadCount(2);
    setIsLoading(false);
  }, [trioId]);

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
        {recentMessages.slice(0, 3).map((message) => (
          <div key={message.id} className="border-l-2 border-gray-200 pl-3">
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">
                    {message.user_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.type !== "text" && (
                    <span className="text-xs">
                      {getMessageIcon(message.type)}
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
          ? formatTimestamp(recentMessages[0].timestamp)
          : "No messages"}
      </div>
    </div>
  );
};
