'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ApiKeyStatus {
  hasKey: boolean;
  keyPrefix: string | null;
  provider: string | null;
  isValid: boolean;
  lastVerified: string | null;
}

export function useApiKeyStatus() {
  return useQuery<ApiKeyStatus>({
    queryKey: ['api-key-status'],
    queryFn: () => api.get('/api/user/api-key'),
    staleTime: 30_000,
  });
}

export function useSetApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (apiKey: string) => api.post('/api/user/api-key', { apiKey }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-key-status'] }),
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/api/user/api-key'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-key-status'] }),
  });
}
