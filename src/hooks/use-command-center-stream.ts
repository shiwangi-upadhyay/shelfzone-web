'use client';

import { useState, useRef, useCallback } from 'react';
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

export interface StreamChunk {
  text: string;
}

export interface CostData {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export function useSendMessage(agentId: string | null, conversationId: string | null) {
  const router = useRouter();
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [totalCost, setTotalCost] = useState<CostData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGenerating = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!agentId || !message.trim()) {
        return;
      }

      // Reset state
      setCurrentResponse('');
      setTotalCost(null);
      setError(null);
      setIsStreaming(true);

      const token = getAuthToken();
      
      if (!token) {
        setError('Not authenticated');
        setIsStreaming(false);
        router.push('/login');
        return;
      }

      try {
        // Create abort controller for the POST request
        abortControllerRef.current = new AbortController();

        // Send the message to initiate streaming
        const response = await fetch(`${API_URL}/api/command-center/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            agentId,
            conversationId,
            message: message.trim(),
          }),
          signal: abortControllerRef.current.signal,
        });

        // Handle errors before streaming starts
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
          
          if (response.status === 403) {
            setError('Your API key is invalid or missing. Please configure it in settings.');
            setIsStreaming(false);
            setTimeout(() => {
              router.push('/dashboard/settings/api-keys?error=invalid_api_key');
            }, 2000);
            return;
          }
          
          if (response.status === 404) {
            setError('Agent not found. Please select a valid agent.');
            setIsStreaming(false);
            return;
          }
          
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        // At this point, response is successful and we should get SSE stream
        // We need to create an EventSource-like handler for the stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';
        let timeoutId: NodeJS.Timeout | null = null;

        // Set 60s timeout
        timeoutId = setTimeout(() => {
          stopGenerating();
          setError('Request timeout after 60 seconds');
        }, 60000);

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              if (timeoutId) clearTimeout(timeoutId);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;

              // Parse SSE format: "event: eventType" and "data: jsonData"
              if (line.startsWith('event: ')) {
                const eventType = line.slice(7).trim();
                continue; // Event type will be followed by data line
              }

              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                
                try {
                  const data = JSON.parse(dataStr);
                  
                  // Determine event type from previous line or data structure
                  if (data.text !== undefined) {
                    // chunk event
                    setCurrentResponse((prev) => prev + data.text);
                  } else if (data.inputTokens !== undefined && data.outputTokens !== undefined) {
                    // cost event
                    setTotalCost({
                      inputTokens: data.inputTokens,
                      outputTokens: data.outputTokens,
                      totalCost: data.totalCost,
                    });
                  } else if (data.error) {
                    // error event
                    setError(data.error);
                    setIsStreaming(false);
                    if (timeoutId) clearTimeout(timeoutId);
                    reader.cancel();
                    return;
                  }
                  // done event is handled by stream ending
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', dataStr, parseError);
                }
              }
            }
          }

          // Stream completed successfully
          setIsStreaming(false);
          if (timeoutId) clearTimeout(timeoutId);
        } catch (readError: any) {
          if (timeoutId) clearTimeout(timeoutId);
          
          if (readError.name === 'AbortError') {
            // User stopped generation
            setIsStreaming(false);
            return;
          }
          
          throw readError;
        }
      } catch (err: any) {
        console.error('Stream error:', err);
        
        if (err.name === 'AbortError') {
          // User stopped generation
          setIsStreaming(false);
          return;
        }
        
        if (err.message?.includes('Failed to fetch') || err.message?.includes('network')) {
          setError('Connection lost. Please check your network and try again.');
        } else {
          setError(err.message || 'An error occurred while sending the message');
        }
        
        setIsStreaming(false);
      }
    },
    [agentId, conversationId, router, stopGenerating]
  );

  return {
    sendMessage,
    isStreaming,
    currentResponse,
    totalCost,
    error,
    stopGenerating,
  };
}
