import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  Users,
  Settings,
} from "lucide-react";

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

interface TrioMember {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
}

interface TrinityChatProps {
  onGoBack?: () => void; // Navigation function
}

export const TrinityChat: React.FC<TrinityChatProps> = ({ onGoBack }) => {
  // Mock user for now - will be replaced with real auth
  const user = useMemo(() => ({ id: "current_user", name: "You" }), []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [trioMembers, setTrioMembers] = useState<TrioMember[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock data per ora - sarà sostituito con dati reali
  useEffect(() => {
    const mockMembers: TrioMember[] = [
      { id: "user1", name: "Marco", online: true },
      { id: "user2", name: "Lisa", online: false, lastSeen: "2 hours ago" },
      { id: user?.id || "current", name: "You", online: true },
    ];

    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        user_id: "user1",
        user_name: "Marco",
        message: "Hey team! How is everyone doing with their weekly goals? 💪",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "text",
      },
      {
        id: "2",
        user_id: user?.id || "current",
        user_name: "You",
        message:
          "Doing great! Just finished my workout. Feeling stronger every day! 🔥",
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        type: "text",
      },
      {
        id: "3",
        user_id: "user2",
        user_name: "Lisa",
        message:
          "Amazing progress everyone! I love seeing our trio support each other ❤️",
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        type: "text",
      },
      {
        id: "4",
        user_id: "system",
        user_name: "Trinity Bot",
        message:
          '🏆 Marco unlocked "Consistency King" badge! Keep up the great work!',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        type: "achievement",
      },
      {
        id: "5",
        user_id: "user1",
        user_name: "Marco",
        message:
          "Thanks for the motivation! Ready for our video call tomorrow? We can share progress and plan next week! 📹",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: "text",
      },
      {
        id: "6",
        user_id: "user2",
        user_name: "Lisa",
        message:
          "Absolutely! Can't wait to see everyone. We're making such good progress together! 🌟",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: "text",
      },
    ];

    setTimeout(() => {
      setTrioMembers(mockMembers);
      setMessages(mockMessages);
      setIsLoading(false);
    }, 500);
  }, [user]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user_id: user?.id || "current",
      user_name: "You",
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageStyle = (message: ChatMessage) => {
    if (message.type === "system" || message.type === "achievement") {
      return "bg-blue-50 border border-blue-200 text-blue-800 text-center text-sm py-2 px-4 rounded-full mx-4";
    }

    const isOwnMessage = message.user_id === user?.id;
    return isOwnMessage
      ? "bg-blue-600 text-white ml-auto max-w-xs lg:max-w-md px-4 py-2 rounded-xl rounded-br-md"
      : "bg-gray-100 text-gray-800 mr-auto max-w-xs lg:max-w-md px-4 py-2 rounded-xl rounded-bl-md";
  };

  const goBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log("Going back to dashboard...");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Trinity Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Trinity Chat
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{trioMembers.filter((m) => m.online).length} online</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Members Status */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center space-x-4">
          {trioMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {member.name.charAt(0)}
                </div>
                {member.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {member.name}
                </p>
                <p className="text-xs text-gray-500">
                  {member.online ? "online" : member.lastSeen}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === "system" || message.type === "achievement" ? (
              <div className={getMessageStyle(message)}>{message.message}</div>
            ) : (
              <div
                className={`flex ${
                  message.user_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex flex-col space-y-1">
                  {message.user_id !== user?.id && (
                    <span className="text-xs text-gray-500 px-4">
                      {message.user_name}
                    </span>
                  )}
                  <div className={getMessageStyle(message)}>
                    <p>{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.user_id === user?.id
                          ? "text-blue-200"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Smile className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to the Trinity..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32"
              rows={1}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
