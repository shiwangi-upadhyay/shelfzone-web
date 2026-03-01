import { useState, useCallback } from 'react';

export function useSendMessage(agentId: string | null, conversationId: string | null) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [totalCost, setTotalCost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!agentId) return;
    
    setIsStreaming(true);
    setCurrentResponse('');
    setError(null);
    setTotalCost(null);
    
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const token = localStorage.getItem('token'); // Or get from auth context
      
      // Use fetch to initiate SSE connection
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/command-center/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId, conversationId, message }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.startsWith('event: chunk')) {
            // Next line should be data
            const dataLine = lines[i + 1];
            if (dataLine?.startsWith('data: ')) {
              try {
                const data = JSON.parse(dataLine.slice(6));
                setCurrentResponse(prev => prev + data.text);
              } catch (e) {
                console.error('Failed to parse chunk data:', e);
              }
              i++; // Skip the data line we just processed
            }
          } else if (line.startsWith('event: cost')) {
            // Next line should be data
            const dataLine = lines[i + 1];
            if (dataLine?.startsWith('data: ')) {
              try {
                const data = JSON.parse(dataLine.slice(6));
                setTotalCost(data);
              } catch (e) {
                console.error('Failed to parse cost data:', e);
              }
              i++; // Skip the data line we just processed
            }
          } else if (line.startsWith('event: done')) {
            break;
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Generation stopped');
      } else {
        setError(err.message || 'Streaming failed');
      }
    } finally {
      setIsStreaming(false);
      setAbortController(null);
    }
  }, [agentId, conversationId]);

  const stopGenerating = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsStreaming(false);
  }, [abortController]);

  return {
    sendMessage,
    isStreaming,
    currentResponse,
    totalCost,
    error,
    stopGenerating,
  };
}
