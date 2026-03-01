'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface GatewayKeyStatus {
  hasKey: boolean;
  keyPrefix?: string;
  fullKey?: string;
  status?: 'active' | 'inactive';
  lastSeen?: string;
  callsToday?: number;
  createdAt?: string;
}

interface TestConnectionResponse {
  success: boolean;
  latencyMs?: number;
  error?: string;
}

export function useGatewayKeyStatus() {
  return useQuery<GatewayKeyStatus>({
    queryKey: ['gateway-key-status'],
    queryFn: async () => {
      const res = await api.get('/api/settings/gateway-key');
      return (res as any).data ?? res;
    },
    staleTime: 30_000,
  });
}

export function useCreateGatewayKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/settings/gateway-key'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gateway-key-status'] }),
  });
}

export function useRegenerateGatewayKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/settings/gateway-key/regenerate'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gateway-key-status'] }),
  });
}

export function useTestGatewayConnection() {
  return useMutation<TestConnectionResponse>({
    mutationFn: async () => {
      const res = await api.post('/api/settings/gateway-key/test');
      return (res as any).data ?? res;
    },
  });
}
