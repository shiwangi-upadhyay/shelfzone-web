import { useState } from 'react';
import { api } from '@/lib/api';

export interface Delegation {
  agentName: string;
  instruction: string;
  reason: string;
}

export interface DelegationResponse {
  message: string;
  delegations?: Delegation[];
}

export function useDelegation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendWithDelegation = async (
    agentId: string,
    conversationId: string | null,
    message: string
  ): Promise<DelegationResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: DelegationResponse }>(
        '/api/command-center/delegate',
        {
          agentId,
          conversationId,
          message,
        }
      );

      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendWithDelegation,
    isLoading,
    error,
  };
}
