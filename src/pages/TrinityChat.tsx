import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  Users,
  Settings,
} from "lucide-react";
import type { ChatMessage } from "../services/trinityChatService";
import { trinityChatService } from "../services/trinityChatService";

interface TrioMember {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
}

interface TrinityChatProps {
  trioId?: string;
  onGoBack?: () => void;
}

export const TrinityChat: React.FC<TrinityChatProps> = ({
  trioId = "3b2b8e7d-0712-4007-9221-36be8b1835d9", // ID del trio reale dal database
  onGoBack,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [trioMembers] = useState<TrioMember[]>([
    { id: "user1", name: "Marco", online: true },
    { id: "user2", name: "Giulia", online: true },
    { id: "you", name: "Tu", online: true },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lista di emoji comuni
  const commonEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "😈",
    "👿",
    "👹",
    "👺",
    "🤡",
    "💩",
    "👻",
    "💀",
    "☠️",
    "👽",
    "👾",
    "🤖",
    "🎃",
    "💪",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "🙏",
    "💯",
    "🔥",
    "💥",
    "⭐",
    "🌟",
    "✨",
    "⚡",
    "💫",
    "💢",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chiudi emoji picker quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker) {
        const target = event.target as HTMLElement;
        if (!target.closest(".emoji-picker-container")) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    // Ottieni l'ID utente corrente
    const getCurrentUser = async () => {
      const userId = await trinityChatService.getCurrentUserId();
      setCurrentUserId(userId || "demo-user");
    };
    getCurrentUser();

    // Carica i messaggi iniziali
    const loadMessages = async () => {
      try {
        const chatMessages = await trinityChatService.getMessages(trioId, 50);
        setMessages(chatMessages);

        // Marca tutti i messaggi come letti quando entra nella chat
        const userId = await trinityChatService.getCurrentUserId();
        if (userId) {
          await trinityChatService.markMessagesAsRead(trioId, userId);
          console.log("🔍 Messages marked as read for user:", userId);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        // Fallback ai dati mock
        const mockMessages: ChatMessage[] = [
          {
            id: "1",
            trio_id: trioId,
            user_id: "user1",
            user_name: "Marco",
            message: "Ciao ragazzi! Come va l'allenamento oggi?",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            updated_at: new Date(Date.now() - 7200000).toISOString(),
            message_type: "text",
          },
          {
            id: "2",
            trio_id: trioId,
            user_id: "user2",
            user_name: "Giulia",
            message:
              "Tutto bene! Ho appena finito la mia sessione di cardio 💪",
            created_at: new Date(Date.now() - 6900000).toISOString(),
            updated_at: new Date(Date.now() - 6900000).toISOString(),
            message_type: "text",
          },
          {
            id: "3",
            trio_id: trioId,
            user_id: "demo-user",
            user_name: "Tu",
            message: "Perfetto! Anch'io sto per iniziare 🔥",
            created_at: new Date(Date.now() - 6600000).toISOString(),
            updated_at: new Date(Date.now() - 6600000).toISOString(),
            message_type: "text",
          },
        ];
        setMessages(mockMessages);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Sottoscrizione ai nuovi messaggi
    const channel = trinityChatService.subscribeToMessages(
      trioId,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      }
    );

    return () => {
      trinityChatService.unsubscribeFromChannel(channel);
    };
  }, [trioId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const sentMessage = await trinityChatService.sendMessage(
        trioId,
        newMessage
      );

      if (sentMessage) {
        // Il messaggio verrà aggiunto automaticamente tramite la sottoscrizione real-time
        setNewMessage("");
      } else {
        // Fallback: aggiungi il messaggio localmente se il servizio non è disponibile
        const mockMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          trio_id: trioId,
          user_id: currentUserId || "demo-user",
          user_name: "Tu",
          message: newMessage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_type: "text",
        };
        setMessages((prev) => [...prev, mockMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback locale in caso di errore
      const mockMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        trio_id: trioId,
        user_id: currentUserId || "demo-user",
        user_name: "Tu",
        message: newMessage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_type: "text",
      };
      setMessages((prev) => [...prev, mockMessage]);
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return `Ieri ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onGoBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Trinity Chat
                </h1>
                <p className="text-sm text-gray-600">
                  {trioMembers.filter((m) => m.online).length} membri online
                </p>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage =
            message.user_id === currentUserId || message.user_name === "Tu";

          return (
            <div
              key={message.id}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {message.user_name}
                  </p>
                )}
                <p className="text-sm">{message.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTimestamp(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1 relative emoji-picker-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scrivi un messaggio..."
              disabled={isSending}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-80 max-h-48 overflow-y-auto z-50">
                <div className="grid grid-cols-10 gap-1">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => addEmoji(emoji)}
                      className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleEmojiPicker}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors emoji-picker-container"
            type="button"
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
