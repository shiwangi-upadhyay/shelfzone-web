'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('shelfzone-auth');
    if (!stored) return null;
    
    const { state } = JSON.parse(stored);
    return state?.accessToken || null;
  } catch {
    return null;
  }
}

export interface CostData {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export interface ConversationCostData {
  lastMessage?: CostData;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  messageCount: number;
}

export function useSendMessage(agentId: string | null, conversationId: string | null) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<any>(null);
  const [conversationCost, setConversationCost] = useState<ConversationCostData>({
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCost: 0,
    messageCount: 0,
  });

  const sendMessage = useCallback(async (message: string) => {
    if (!agentId) return;
    
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    const token = getAuthToken();
    
    if (!token) {
      setError('Not authenticated');
      setIsLoading(false);
      router.push('/login');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/command-center/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId,
          conversationId,
          message
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Request failed' }));
        
        if (res.status === 403) {
          setError('Your API key is invalid or missing. Please configure it in settings.');
          setIsLoading(false);
          setTimeout(() => {
            router.push('/dashboard/settings/api-keys?error=invalid_api_key');
          }, 2000);
          return;
        }
        
        if (res.status === 404) {
          setError('Agent not found. Please select a valid agent.');
          setIsLoading(false);
          return;
        }
        
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const jsonData = await res.json();
      const data = jsonData.data || jsonData;
      
      setResponse(data.message);
      
      const messageCost = {
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalCost: data.totalCost
      };
      
      setTotalCost(messageCost);
      
      // Update conversation cost
      setConversationCost((prev) => ({
        lastMessage: messageCost,
        totalInputTokens: prev.totalInputTokens + data.inputTokens,
        totalOutputTokens: prev.totalOutputTokens + data.outputTokens,
        totalCost: prev.totalCost + data.totalCost,
        messageCount: prev.messageCount + 1,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [agentId, conversationId, router]);

  // Reset conversation cost when conversation changes
  useEffect(() => {
    setConversationCost({
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      messageCount: 0,
    });
  }, [conversationId]);

  return {
    sendMessage,
    isLoading,
    response,
    totalCost,
    conversationCost,
    error
  };
}
