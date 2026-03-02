import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ConversationTab {
  id: string;
  userId: string;
  title: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  conversations: Array<{
    id: string;
    title: string;
    agentId: string;
    updatedAt: string;
  }>;
}

export interface CreateTabInput {
  title?: string;
}

export interface UpdateTabInput {
  title?: string;
  position?: number;
  isActive?: boolean;
}

// Get all tabs
export function useConversationTabs() {
  return useQuery({
    queryKey: ['conversation-tabs'],
    queryFn: async () => {
      const response = await api.get<{ data: ConversationTab[] }>(
        '/command-center/tabs'
      );
      return response.data;
    },
  });
}

// Get active tab
export function useActiveTab() {
  return useQuery({
    queryKey: ['conversation-tabs', 'active'],
    queryFn: async () => {
      const response = await api.get<{ data: ConversationTab | null }>(
        '/command-center/tabs/active'
      );
      return response.data;
    },
  });
}

// Create new tab
export function useCreateTab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTabInput) => {
      const response = await api.post<{ data: ConversationTab }>(
        '/command-center/tabs',
        input
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-tabs'] });
    },
  });
}

// Update tab
export function useUpdateTab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTabInput }) => {
      const response = await api.patch<{ data: ConversationTab }>(
        `/command-center/tabs/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-tabs'] });
    },
  });
}

// Delete tab
export function useDeleteTab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ data: { deleted: boolean } }>(
        `/command-center/tabs/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-tabs'] });
    },
  });
}
