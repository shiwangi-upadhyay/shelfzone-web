'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  tokenCount?: number;
  cost?: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

/**
 * Hook to fetch conversation for a specific agent
 * @param agentId - The agent ID to fetch conversation for
 * @param options - Query options
 */
export function useAgentConversation(
  agentId: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['command-center-conversation', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      
      // Fetch conversation for this agent
      const response = await api.get<{ data: Conversation | null }>(
        `/api/command-center/conversations?agentId=${agentId}`
      );
      
      return response.data || null;
    },
    enabled: options?.enabled !== false && !!agentId,
    staleTime: 0, // Always fetch fresh data when agent changes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch all conversations for the current user
 */
export function useConversations() {
  return useQuery({
    queryKey: ['command-center-conversations'],
    queryFn: async () => {
      const response = await api.get<{ data: Conversation[] }>(
        '/api/command-center/conversations'
      );
      return response.data || [];
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Hook to fetch a specific conversation by ID with messages
 * @param conversationId - The conversation ID
 */
export function useConversationById(conversationId: string | null) {
  return useQuery({
    queryKey: ['command-center-conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      
      const response = await api.get<{ data: Conversation }>(
        `/api/command-center/conversations/${conversationId}`
      );
      
      return response.data;
    },
    enabled: !!conversationId,
    staleTime: 0,
  });
}
