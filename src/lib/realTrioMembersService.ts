/**
 * TRINITY FAT LOSS - Service per fetchare membri reali del trio
 * Ottiene i nomi reali dal database invece di usare mock data
 */

import { supabase } from "./supabase";
import type { UserMatch } from "./supabase";

export interface TrioMemberData {
  id: string;
  name: string;
  email?: string;
  isCurrentUser?: boolean;
}

/**
 * Service per ottenere i membri reali del trio dal database
 */
export class RealTrioMembersService {
  /**
   * Ottieni il trio dell'utente corrente
   */
  static async getCurrentUserTrio(
    currentUserId: string
  ): Promise<UserMatch | null> {
    try {
      console.log("Trying to fetch trio for user:", currentUserId);
      const { data, error } = await supabase
        .from("user_matches")
        .select("*")
        .or(
          `user1_id.eq.${currentUserId},user2_id.eq.${currentUserId},user3_id.eq.${currentUserId}`
        )
        .eq("status", "active")
        .single();

      if (error) {
        console.log("Error fetching trio:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getCurrentUserTrio:", error);
      return null;
    }
  }

  /**
   * Ottieni i profili degli utenti del trio
   */
  static async getTrioMembersProfiles(
    trio: UserMatch
  ): Promise<TrioMemberData[]> {
    try {
      const userIds = [trio.user1_id, trio.user2_id, trio.user3_id];

      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, name, email")
        .in("id", userIds);

      if (error) {
        console.log("Error fetching member profiles:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getTrioMembersProfiles:", error);
      return [];
    }
  }

  /**
   * Ottieni i membri del trio dell'utente corrente con i loro nomi reali
   */
  static async getCurrentTrioMembers(
    currentUserId: string
  ): Promise<TrioMemberData[]> {
    try {
      // 1. Ottieni il trio dell'utente
      const trio = await this.getCurrentUserTrio(currentUserId);

      if (!trio) {
        console.log("No active trio found for user:", currentUserId);
        return [];
      }

      // 2. Ottieni i profili dei membri
      const members = await this.getTrioMembersProfiles(trio);

      // 3. Aggiungi flag per utente corrente
      return members.map((member) => ({
        ...member,
        isCurrentUser: member.id === currentUserId,
      }));
    } catch (error) {
      console.error("Error in getCurrentTrioMembers:", error);
      return [];
    }
  }

  /**
   * Formatta il nome per la visualizzazione
   */
  static formatDisplayName(
    member: TrioMemberData,
    showAsYou: boolean = true
  ): string {
    if (member.isCurrentUser && showAsYou) {
      return "Tu";
    }
    return member.name || `Membro ${member.id.slice(-4)}`;
  }

  /**
   * Ottieni iniziali per avatar
   */
  static getInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }
}

/**
 * Hook React per ottenere i membri reali del trio
 */
export function useRealTrioMembers(currentUserId?: string) {
  const [members, setMembers] = React.useState<TrioMemberData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMembers = async () => {
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const trioMembers = await RealTrioMembersService.getCurrentTrioMembers(
          currentUserId
        );
        setMembers(trioMembers);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore nel caricamento dei membri"
        );
        console.error("Error in useRealTrioMembers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [currentUserId]);

  const getDisplayName = React.useCallback((member: TrioMemberData) => {
    return RealTrioMembersService.formatDisplayName(member);
  }, []);

  const getCurrentMember = React.useMemo(() => {
    return members.find((member) => member.isCurrentUser) || null;
  }, [members]);

  const getOtherMembers = React.useMemo(() => {
    return members.filter((member) => !member.isCurrentUser);
  }, [members]);

  return {
    members,
    currentMember: getCurrentMember,
    otherMembers: getOtherMembers,
    isLoading,
    error,
    getDisplayName,
    getInitials: RealTrioMembersService.getInitials,
  };
}

// Import React per il hook
import React from "react";
