'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentSelector } from '@/components/command-center/agent-selector';
import { ChatInterface } from '@/components/command-center/chat-interface';
import { ConversationTabs } from '@/components/command-center/conversation-tabs';
import { DelegationCard } from '@/components/command-center/delegation-card';
import { ActivitySidebar } from '@/components/command-center/activity-sidebar';
import { CostBreakdown } from '@/components/command-center/cost-breakdown';
import { SearchDialog } from '@/components/command-center/search-dialog';
import { useSendMessage } from '@/hooks/use-command-center-stream';
import { useDelegation, Delegation } from '@/hooks/use-delegation';
import { useApiKeyStatus } from '@/hooks/use-api-key';
import { useAgentConversation } from '@/hooks/use-conversations';
import { useActiveTab } from '@/hooks/use-conversation-tabs';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ErrorState } from '@/components/ui/error-state';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  delegations?: Delegation[];
}

export default function CommandCenterPage() {
  const router = useRouter();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentTabId, setCurrentTabId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const { data: keyStatus, isLoading: keyLoading, error: keyError, refetch: refetchKey } = useApiKeyStatus();
  const { sendWithDelegation, isLoading: isDelegating } = useDelegation();
  
  // Get active tab
  const { data: activeTab } = useActiveTab();

  // Update current tab when active tab changes
  useEffect(() => {
    if (activeTab?.id && activeTab.id !== currentTabId) {
      setCurrentTabId(activeTab.id);
      // Clear messages when switching tabs
      setMessages([]);
      setConversationId(null);
    }
  }, [activeTab?.id, currentTabId]);
  
  // Load conversation for selected agent in current tab
  const { 
    data: conversation, 
    isLoading: conversationLoading,
    refetch: refetchConversation 
  } = useAgentConversation(selectedAgentId, currentTabId);
  
  const { 
    sendMessage, 
    isStreaming, 
    currentResponse, 
    totalCost,
    error: streamError,
    stopGenerating
  } = useSendMessage(selectedAgentId, conversationId);

  const hasValidKey = keyStatus?.hasKey && keyStatus?.isValid;

  // Fetch selected agent details to check if it's SHIWANGI
  const { data: agentDetails } = useQuery({
    queryKey: ['agent-details', selectedAgentId],
    queryFn: async () => {
      if (!selectedAgentId) return null;
      const response = await api.get<{ data: { name: string } }>(`/api/agent-portal/agents/${selectedAgentId}`);
      return response.data;
    },
    enabled: !!selectedAgentId,
  });

  // Update selected agent name when agent details load
  useEffect(() => {
    if (agentDetails) {
      setSelectedAgentName(agentDetails.name);
    }
  }, [agentDetails]);

  // Load conversation when agent changes
  useEffect(() => {
    if (selectedAgentId) {
      // Clear messages immediately when switching agents
      setMessages([]);
      setConversationId(null);
      
      // The useAgentConversation hook will fetch the conversation
      // and the next useEffect will load messages
    }
  }, [selectedAgentId]);

  // Load messages from fetched conversation
  useEffect(() => {
    if (conversation) {
      setConversationId(conversation.id);
      
      // Map conversation messages to local message format
      const loadedMessages: Message[] = (conversation.messages || []).map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      }));
      
      setMessages(loadedMessages);
    } else if (selectedAgentId && !conversationLoading) {
      // No conversation exists yet, start fresh
      setMessages([]);
      setConversationId(null);
    }
  }, [conversation, selectedAgentId, conversationLoading]);

  // When response arrives, add assistant message
  useEffect(() => {
    if (currentResponse && messages.length > 0 && !isStreaming) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'user') {
        // Only add if we don't already have an assistant response after this user message
        const hasAssistantResponse = messages.slice(-1)[0].role === 'assistant';
        if (!hasAssistantResponse) {
          setMessages(prev => [...prev, {
            id: Math.random().toString(36),
            role: 'assistant',
            content: currentResponse,
            timestamp: new Date().toISOString()
          }]);
          
          // Refetch conversation to get updated messages from DB
          setTimeout(() => {
            refetchConversation();
          }, 500);
        }
      }
    }
  }, [currentResponse, isStreaming, refetchConversation]); // Deliberately not including messages to avoid infinite loop

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Esc: Stop generation (works even when typing)
      if (e.key === 'Escape' && isStreaming) {
        stopGenerating();
        return;
      }

      // Don't trigger other shortcuts while typing
      if (isTyping && e.key !== 'Escape') return;

      // Ctrl+K: Search conversations
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Note: Ctrl+N (new tab), Ctrl+W (close tab), Ctrl+1/2/3 (switch tabs)
      // are handled by ConversationTabs component
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming, stopGenerating]);

  const handleSend = useCallback(
    async (message: string, attachments?: any[]) => {
      if (!selectedAgentId || !hasValidKey || isStreaming || isDelegating) return;

      // Add user message to chat immediately
      const userMsg: Message = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Check if SHIWANGI is selected - use delegation endpoint
      if (selectedAgentName === 'SHIWANGI') {
        const result = await sendWithDelegation(selectedAgentId, conversationId, message);
        
        if (result) {
          // Add assistant message with delegations
          const assistantMsg: Message = {
            id: Math.random().toString(36).slice(2) + Date.now().toString(36),
            role: 'assistant',
            content: result.message,
            timestamp: new Date().toISOString(),
            delegations: result.delegations,
          };
          setMessages((prev) => [...prev, assistantMsg]);

          // Refetch conversation to get updated messages from DB
          setTimeout(() => {
            refetchConversation();
          }, 500);
        }
      } else {
        // Use regular streaming for other agents (with optional attachments)
        await sendMessage(message, attachments);
      }
    },
    [selectedAgentId, selectedAgentName, conversationId, hasValidKey, isStreaming, isDelegating, sendMessage, sendWithDelegation, refetchConversation]
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
    <div className="flex flex-col h-[calc(100vh-7rem)] rounded-xl border bg-background overflow-hidden">
      {/* Conversation Tabs */}
      <ConversationTabs 
        onTabChange={(tabId) => {
          // Tab switching - clear current chat and trigger reload
          setCurrentTabId(tabId);
          setMessages([]);
          setConversationId(null);
          refetchConversation();
        }}
      />

      <div className="flex flex-1 overflow-hidden relative">
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
          conversationId={conversationId}
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={currentResponse}
          totalCost={totalCost}
          onSend={handleSend}
          onStopGenerating={stopGenerating}
          disabled={!selectedAgentId || !hasValidKey || conversationLoading}
          error={streamError}
        />

        {/* Right Sidebar - Activity + Cost */}
        <div className="w-80 border-l bg-background flex-shrink-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <ActivitySidebar />
          </div>
          <div className="flex-1 min-h-0 border-t">
            <CostBreakdown />
          </div>
        </div>
      </div>

      {/* Search Dialog (Ctrl+K) */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
