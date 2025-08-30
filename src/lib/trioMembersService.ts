/**
 * TRINITY FAT LOSS - Trio Members Service
 * Gestione dei membri del trio e i loro dati
 */

import React from "react";

export interface TrioMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: "leader" | "member";
  joined_at: string;
  active: boolean;
}

export interface Trio {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  members: TrioMember[];
}

/**
 * Service per gestire i trii e i loro membri
 */
export class TrioMembersService {
  /**
   * Ottieni i dettagli di un trio con i suoi membri
   */
  static async getTrioWithMembers(trioId: string): Promise<Trio | null> {
    try {
      // Per ora usiamo dati mock realistici
      // In futuro questo farà query al database reale

      // Mock data con nomi reali del trio Trinity Fat Loss
      const mockTrio: Trio = {
        id: trioId,
        name: "Trinity Fat Loss Team",
        description:
          "Il nostro trio di supporto per il percorso di dimagrimento",
        created_at: "2025-01-15T10:00:00Z",
        members: [
          {
            id: "claudio_member_1",
            name: "Claudio",
            email: "claudio@trinity-fat-loss.com",
            role: "leader",
            joined_at: "2025-01-15T10:00:00Z",
            active: true,
          },
          {
            id: "anna_member_2",
            name: "Anna",
            email: "anna@trinity-fat-loss.com",
            role: "member",
            joined_at: "2025-01-16T09:30:00Z",
            active: true,
          },
          {
            id: "matteo_member_3",
            name: "Matteo",
            email: "matteo@trinity-fat-loss.com",
            role: "member",
            joined_at: "2025-01-17T14:15:00Z",
            active: true,
          },
        ],
      };

      return mockTrio;
    } catch (error) {
      console.error("Errore nel recupero del trio:", error);
      return null;
    }
  }

  /**
   * Ottieni solo i membri di un trio
   */
  static async getTrioMembers(trioId: string): Promise<TrioMember[]> {
    const trio = await this.getTrioWithMembers(trioId);
    return trio?.members || [];
  }

  /**
   * Ottieni un membro specifico
   */
  static async getTrioMember(
    trioId: string,
    userId: string
  ): Promise<TrioMember | null> {
    const members = await this.getTrioMembers(trioId);
    return members.find((member) => member.id === userId) || null;
  }

  /**
   * Ottieni gli altri membri (escludendo l'utente corrente)
   */
  static async getOtherMembers(
    trioId: string,
    currentUserId: string
  ): Promise<TrioMember[]> {
    const members = await this.getTrioMembers(trioId);
    return members.filter((member) => member.id !== currentUserId);
  }

  /**
   * Mappa un userId ad un nome user-friendly
   */
  static async getUserDisplayName(
    trioId: string,
    userId: string,
    currentUserId?: string
  ): Promise<string> {
    if (currentUserId && userId === currentUserId) {
      return "Tu";
    }

    const member = await this.getTrioMember(trioId, userId);
    return member?.name || `Membro ${userId.slice(-4)}`;
  }

  /**
   * Ottieni l'iniziale per l'avatar
   */
  static getInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Verifica se un utente è il leader del trio
   */
  static async isTrioLeader(trioId: string, userId: string): Promise<boolean> {
    const member = await this.getTrioMember(trioId, userId);
    return member?.role === "leader";
  }

  /**
   * Genera colori avatar consistenti per un utente
   */
  static getAvatarColor(userId: string): string {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];

    // Genera un indice consistente basato sull'ID utente
    const hash = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}

/**
 * Hook React per gestire i membri del trio
 */
export function useTrioMembers(trioId: string, currentUserId?: string) {
  const [trio, setTrio] = React.useState<Trio | null>(null);
  const [members, setMembers] = React.useState<TrioMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTrioData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const trioData = await TrioMembersService.getTrioWithMembers(trioId);

        if (trioData) {
          setTrio(trioData);
          setMembers(trioData.members);
        } else {
          setError("Trio non trovato");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Errore nel caricamento del trio"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (trioId) {
      loadTrioData();
    }
  }, [trioId]);

  // Utility functions
  const getCurrentMember = React.useMemo(() => {
    if (!currentUserId) return null;
    return members.find((member) => member.id === currentUserId) || null;
  }, [members, currentUserId]);

  const getOtherMembers = React.useMemo(() => {
    if (!currentUserId) return members;
    return members.filter((member) => member.id !== currentUserId);
  }, [members, currentUserId]);

  const getUserDisplayName = React.useCallback(
    (userId: string) => {
      if (currentUserId && userId === currentUserId) {
        return "Tu";
      }
      const member = members.find((m) => m.id === userId);
      return member?.name || `Membro ${userId.slice(-4)}`;
    },
    [members, currentUserId]
  );

  return {
    trio,
    members,
    currentMember: getCurrentMember,
    otherMembers: getOtherMembers,
    isLoading,
    error,
    getUserDisplayName,

    // Utility functions
    getInitials: TrioMembersService.getInitials,
    getAvatarColor: TrioMembersService.getAvatarColor,
  };
}

// Re-export per compatibilità
export { useTrioMembers as default };
