'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentSelector } from '@/components/command-center/agent-selector';
import { ChatInterface } from '@/components/command-center/chat-interface';
import { useSendMessage } from '@/hooks/use-command-center-stream';
import { useApiKeyStatus } from '@/hooks/use-api-key';
import { ErrorState } from '@/components/ui/error-state';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function CommandCenterPage() {
  const router = useRouter();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId] = useState<string | null>(null); // TODO: Step 6 - load from conversations
  
  const { data: keyStatus, isLoading: keyLoading, error: keyError, refetch: refetchKey } = useApiKeyStatus();
  const { 
    sendMessage, 
    isStreaming, 
    currentResponse, 
    conversationCost, 
    error: streamError,
    stopGenerating 
  } = useSendMessage(selectedAgentId, conversationId);

  const hasValidKey = keyStatus?.hasKey && keyStatus?.isValid;

  // Reset conversation when switching agents
  useEffect(() => {
    if (selectedAgentId) {
      setMessages([]);
    }
  }, [selectedAgentId]);

  // When streaming completes, save the assistant message
  useEffect(() => {
    if (!isStreaming && currentResponse && messages.length > 0) {
      // Only add if the last message is from user (streaming just completed)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        const assistantMsg: Message = {
          id: Math.random().toString(36).slice(2) + Date.now().toString(36),
          role: 'assistant',
          content: currentResponse,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    }
  }, [isStreaming, currentResponse]); // Deliberately not including messages to avoid infinite loop

  const handleSend = useCallback(
    async (message: string) => {
      if (!selectedAgentId || !hasValidKey || isStreaming) return;

      // Add user message to chat immediately
      const userMsg: Message = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Start streaming
      await sendMessage(message);
    },
    [selectedAgentId, hasValidKey, isStreaming, sendMessage]
  );

  // Loading state
  if (keyLoading) {
    return (
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent" />
      </div>
    );
  }

  // Error state
  if (keyError) {
    return <ErrorState title="Failed to load Command Center" message="Unable to check API key status. Please try again." onRetry={refetchKey} />;
  }

  // Gate: no valid key
  if (!hasValidKey) {
    return (
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Set your Anthropic API key to start using your agents</h2>
          <p className="text-sm text-muted-foreground">
            The Command Center uses your personal API key to interact with AI agents. Your key is encrypted and never shared.
          </p>
          <Button onClick={() => router.push('/dashboard/settings/api-keys')}>
            Go to API Key Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] rounded-xl border bg-background overflow-hidden relative">
      {/* Error banner */}
      {streamError && (
        <div className="absolute top-0 inset-x-0 z-10 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-300 text-center">
          {streamError}
          {streamError.includes('API key') && (
            <>
              {' '}
              <button
                onClick={() => router.push('/dashboard/settings/api-keys')}
                className="underline font-medium hover:text-red-900 dark:hover:text-red-100"
              >
                Update settings
              </button>
            </>
          )}
        </div>
      )}

      {/* Left Sidebar - Agent List */}
      <AgentSelector 
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
      />

      {/* Center Panel - Chat */}
      <ChatInterface
        selectedAgentId={selectedAgentId}
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={currentResponse}
        conversationCost={conversationCost}
        onSend={handleSend}
        onStopGenerating={stopGenerating}
        disabled={!selectedAgentId || !hasValidKey}
        error={streamError}
      />

      {/* Right Sidebar - Hidden for now (Phase 3) */}
      {/* TODO: Show cost breakdown when totalCost is available */}
    </div>
  );
}
