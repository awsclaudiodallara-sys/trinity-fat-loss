import { supabase } from "../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface ChatMessage {
  id: string;
  trio_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  message: string;
  message_type: "text" | "image" | "achievement" | "system";
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TypingUser {
  user_id: string;
  user_name: string;
  is_typing: boolean;
}

export interface ChatService {
  // Messaggi
  sendMessage: (
    trioId: string,
    message: string,
    messageType?: string
  ) => Promise<ChatMessage | null>;
  getMessages: (trioId: string, limit?: number) => Promise<ChatMessage[]>;
  getUnreadCount: (trioId: string, userId: string) => Promise<number>;
  markMessagesAsRead: (trioId: string, userId: string) => Promise<void>;

  // Typing indicators
  setTypingStatus: (trioId: string, isTyping: boolean) => Promise<void>;
  getTypingUsers: (
    trioId: string,
    excludeUserId?: string
  ) => Promise<TypingUser[]>;

  // Real-time subscriptions
  subscribeToMessages: (
    trioId: string,
    callback: (message: ChatMessage) => void
  ) => RealtimeChannel;
  subscribeToTyping: (
    trioId: string,
    callback: (users: TypingUser[]) => void
  ) => RealtimeChannel;

  // Utility
  getCurrentUserId: () => Promise<string | null>;
  unsubscribeFromChannel: (channel: RealtimeChannel) => void;
}

class TrinityChatService implements ChatService {
  async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  async sendMessage(
    trioId: string,
    message: string,
    messageType: string = "text"
  ): Promise<ChatMessage | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("trinity_chat_messages")
        .insert({
          trio_id: trioId,
          user_id: userId,
          message: message.trim(),
          message_type: messageType,
          metadata: {},
        })
        .select(
          `
          *,
          user_profiles(name, email)
        `
        )
        .single();

      if (error) {
        console.error("Error sending message:", error);
        return null;
      }

      // Trasforma i dati nel formato atteso
      const chatMessage: ChatMessage = {
        id: data.id,
        trio_id: data.trio_id,
        user_id: data.user_id,
        user_name: data.user_profiles?.name || "Unknown User",
        user_email: data.user_profiles?.email || "",
        message: data.message,
        message_type: data.message_type,
        metadata: data.metadata,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return chatMessage;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return null;
    }
  }

  async getMessages(
    trioId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from("trinity_chat_messages")
        .select(
          `
          *,
          user_profiles(name, email)
        `
        )
        .eq("trio_id", trioId)
        .order("created_at", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }

      return data.map(
        (msg: Record<string, unknown>) =>
          ({
            id: msg.id,
            trio_id: msg.trio_id,
            user_id: msg.user_id,
            user_name:
              (msg.user_profiles as { name: string; email: string } | null)
                ?.name || "Unknown User",
            user_email:
              (msg.user_profiles as { name: string; email: string } | null)
                ?.email || "",
            message: msg.message,
            message_type: msg.message_type,
            metadata: msg.metadata || {},
            created_at: msg.created_at,
            updated_at: msg.updated_at,
          } as ChatMessage)
      );
    } catch (error) {
      console.error("Error in getMessages:", error);
      return [];
    }
  }

  async getUnreadCount(trioId: string, userId: string): Promise<number> {
    try {
      // Ottieni l'ultimo messaggio letto dall'utente
      const { data: lastRead } = await supabase
        .from("trinity_chat_read_status")
        .select("message_id, trinity_chat_messages!inner(created_at)")
        .eq("user_id", userId)
        .order("read_at", { ascending: false })
        .limit(1)
        .single();

      let lastReadTime = "1970-01-01T00:00:00Z"; // Epoca se non ha mai letto
      if (lastRead && lastRead.trinity_chat_messages) {
        const messageData = Array.isArray(lastRead.trinity_chat_messages)
          ? lastRead.trinity_chat_messages[0]
          : lastRead.trinity_chat_messages;
        lastReadTime = (messageData as { created_at: string }).created_at;
      }

      // Conta i messaggi dopo l'ultimo letto
      const { count, error } = await supabase
        .from("trinity_chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("trio_id", trioId)
        .neq("user_id", userId) // Escludi i propri messaggi
        .gt("created_at", lastReadTime);

      if (error) {
        console.error("Error getting unread count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getUnreadCount:", error);
      return 0;
    }
  }

  async markMessagesAsRead(trioId: string, userId: string): Promise<void> {
    try {
      // Ottieni l'ultimo messaggio del trio
      const { data: lastMessage } = await supabase
        .from("trinity_chat_messages")
        .select("id")
        .eq("trio_id", trioId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!lastMessage) return;

      // Marca come letto
      await supabase.from("trinity_chat_read_status").upsert(
        {
          message_id: lastMessage.id,
          user_id: userId,
        },
        {
          onConflict: "message_id,user_id",
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  async setTypingStatus(trioId: string, isTyping: boolean): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      if (isTyping) {
        // Inserisci o aggiorna lo stato di typing
        await supabase.from("trinity_chat_typing").upsert(
          {
            trio_id: trioId,
            user_id: userId,
            is_typing: true,
            started_at: new Date().toISOString(),
          },
          {
            onConflict: "trio_id,user_id",
          }
        );
      } else {
        // Rimuovi lo stato di typing
        await supabase
          .from("trinity_chat_typing")
          .delete()
          .eq("trio_id", trioId)
          .eq("user_id", userId);
      }
    } catch (error) {
      console.error("Error setting typing status:", error);
    }
  }

  async getTypingUsers(
    trioId: string,
    excludeUserId?: string
  ): Promise<TypingUser[]> {
    try {
      let query = supabase
        .from("trinity_chat_typing")
        .select(
          `
          user_id,
          user_profiles(name)
        `
        )
        .eq("trio_id", trioId)
        .eq("is_typing", true)
        .gt("started_at", new Date(Date.now() - 30000).toISOString()); // Ultimi 30 secondi

      if (excludeUserId) {
        query = query.neq("user_id", excludeUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error getting typing users:", error);
        return [];
      }

      return data.map(
        (item: {
          user_id: string;
          user_profiles: { name: string }[] | { name: string } | null;
        }) => {
          let userName = "Unknown User";

          if (item.user_profiles) {
            if (Array.isArray(item.user_profiles)) {
              userName = item.user_profiles[0]?.name || "Unknown User";
            } else {
              userName = item.user_profiles.name || "Unknown User";
            }
          }

          return {
            user_id: item.user_id,
            user_name: userName,
            is_typing: true,
          };
        }
      );
    } catch (error) {
      console.error("Error in getTypingUsers:", error);
      return [];
    }
  }

  subscribeToMessages(
    trioId: string,
    callback: (message: ChatMessage) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`trinity-chat-${trioId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trinity_chat_messages",
          filter: `trio_id=eq.${trioId}`,
        },
        async (payload) => {
          // Ottieni i dati completi del messaggio con le info utente
          const { data } = await supabase
            .from("trinity_chat_messages")
            .select(
              `
              *,
              user_profiles(name, email)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const chatMessage: ChatMessage = {
              id: data.id,
              trio_id: data.trio_id,
              user_id: data.user_id,
              user_name: data.user_profiles?.name || "Unknown User",
              user_email: data.user_profiles?.email || "",
              message: data.message,
              message_type: data.message_type,
              metadata: data.metadata || {},
              created_at: data.created_at,
              updated_at: data.updated_at,
            };

            callback(chatMessage);
          }
        }
      )
      .subscribe();

    return channel;
  }

  subscribeToTyping(
    trioId: string,
    callback: (users: TypingUser[]) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`trinity-typing-${trioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trinity_chat_typing",
          filter: `trio_id=eq.${trioId}`,
        },
        async () => {
          // Quando cambia qualcosa nella tabella typing, ottieni la lista aggiornata
          const currentUserId = await this.getCurrentUserId();
          const typingUsers = await this.getTypingUsers(
            trioId,
            currentUserId || undefined
          );
          callback(typingUsers);
        }
      )
      .subscribe();

    return channel;
  }

  unsubscribeFromChannel(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  }
}

// Istanza singleton del servizio chat
export const trinityChatService = new TrinityChatService();

// Hook React per usare la chat
export const useTrinityChat = (trioId: string) => {
  return {
    sendMessage: (message: string, type?: string) =>
      trinityChatService.sendMessage(trioId, message, type),
    getMessages: (limit?: number) =>
      trinityChatService.getMessages(trioId, limit),
    getUnreadCount: (userId: string) =>
      trinityChatService.getUnreadCount(trioId, userId),
    markAsRead: (userId: string) =>
      trinityChatService.markMessagesAsRead(trioId, userId),
    setTyping: (isTyping: boolean) =>
      trinityChatService.setTypingStatus(trioId, isTyping),
    getTypingUsers: (excludeUserId?: string) =>
      trinityChatService.getTypingUsers(trioId, excludeUserId),
    subscribeToMessages: (callback: (message: ChatMessage) => void) =>
      trinityChatService.subscribeToMessages(trioId, callback),
    subscribeToTyping: (callback: (users: TypingUser[]) => void) =>
      trinityChatService.subscribeToTyping(trioId, callback),
    unsubscribe: (channel: RealtimeChannel) =>
      trinityChatService.unsubscribeFromChannel(channel),
  };
};
